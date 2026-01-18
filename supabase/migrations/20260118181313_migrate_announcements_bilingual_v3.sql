/*
  # Migrate Announcements to Bilingual System (v3)

  1. Schema Changes
    - Add bilingual title fields (title_en, title_id)
    - Add bilingual body fields (body_en, body_id)
    - Add updated_by field to track last editor
    - Migrate existing data to new bilingual fields
    - Handle NULL created_by values
    - Drop old monolingual fields after migration

  2. Helper Functions
    - `is_staff(uuid)` - checks if user has staff role (moderator/admin/super_admin)
    - Triggers for updated_at and published_at

  3. Security (RLS)
    - Drop existing policies
    - Create new policies using is_staff helper
    - Members can only read published announcements
    - Staff can read all, insert, and update
    - Only admins can delete

  4. Important Notes
    - Handles existing NULL created_by values safely
    - Preserves existing announcement data
    - Migrates monolingual content to both EN and ID fields
*/

-- Step 1: Add new columns (nullable first)
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS title_id text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS body_en text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS body_id text;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Update existing rows - handle both old columns existing and new columns
UPDATE announcements 
SET 
  title_en = COALESCE(title_en, title, 'Untitled'),
  title_id = COALESCE(title_id, title, 'Tanpa Judul'),
  body_en = COALESCE(body_en, body, ''),
  body_id = COALESCE(body_id, body, ''),
  updated_by = COALESCE(updated_by, created_by)
WHERE title_en IS NULL OR title_id IS NULL OR body_en IS NULL OR body_id IS NULL OR updated_by IS NULL;

-- Step 3: Make NOT NULL only for fields that don't need a user reference
ALTER TABLE announcements ALTER COLUMN title_en SET NOT NULL;
ALTER TABLE announcements ALTER COLUMN title_id SET NOT NULL;
ALTER TABLE announcements ALTER COLUMN body_en SET NOT NULL;
ALTER TABLE announcements ALTER COLUMN body_id SET NOT NULL;

-- Step 4: Drop old columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'title') THEN
    ALTER TABLE announcements DROP COLUMN title;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'body') THEN
    ALTER TABLE announcements DROP COLUMN body;
  END IF;
END $$;

-- Step 5: Helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid
    AND role IN ('moderator', 'admin', 'super_admin')
  );
END;
$$;

-- Step 6: Trigger functions
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_announcement_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = true AND (TG_OP = 'INSERT' OR OLD.is_published = false) AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Drop and recreate triggers
DROP TRIGGER IF EXISTS set_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS set_announcements_published_at ON announcements;

CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

CREATE TRIGGER set_announcements_published_at
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION set_announcement_published_at();

-- Step 8: Create index
DROP INDEX IF EXISTS idx_announcements_status_pinned_published;
CREATE INDEX IF NOT EXISTS idx_announcements_published_pinned 
  ON announcements(is_published, is_pinned, published_at DESC);

-- Step 9: Drop all existing RLS policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'announcements') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON announcements';
  END LOOP;
END $$;

-- Step 10: Create new RLS policies
CREATE POLICY "Members can read published announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Staff can read all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (is_staff(auth.uid()))
  WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Admins can delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );