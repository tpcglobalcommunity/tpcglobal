/*
  # Member Area V1: Complete Setup with Onboarding

  1. Tables
    - `announcements` (already exists, columns added in previous migration)
    - `member_onboarding` (NEW)

  2. Triggers
    - Auto-update `updated_at` on both tables
    - Auto-set `published_at` when `is_published` becomes true
    - Auto-compute `completed` when all three onboarding steps are true

  3. Security
    - Enable RLS on both tables
    - Announcements: members read published only, mods/admins manage all
    - Onboarding: users can only access their own row
    - Indexes for performance

  4. Seed Data
    - 2 initial announcements (welcome + guidelines)
*/

-- Create member_onboarding table if not exists
CREATE TABLE IF NOT EXISTS member_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_disclaimer boolean NOT NULL DEFAULT false,
  joined_telegram boolean NOT NULL DEFAULT false,
  read_docs boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function for updated_at (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to announcements
DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to member_onboarding
DROP TRIGGER IF EXISTS member_onboarding_updated_at ON member_onboarding;
CREATE TRIGGER member_onboarding_updated_at
  BEFORE UPDATE ON member_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-set published_at when is_published becomes true (UPDATE only)
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Only applies to UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    IF NEW.is_published = true AND OLD.is_published = false AND NEW.published_at IS NULL THEN
      NEW.published_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS announcements_set_published_at ON announcements;
CREATE TRIGGER announcements_set_published_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- Trigger to auto-compute completed when all three steps are true
CREATE OR REPLACE FUNCTION compute_onboarding_completed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completed = (NEW.accepted_disclaimer AND NEW.joined_telegram AND NEW.read_docs);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_onboarding_compute_completed ON member_onboarding;
CREATE TRIGGER member_onboarding_compute_completed
  BEFORE INSERT OR UPDATE ON member_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION compute_onboarding_completed();

-- Function to ensure onboarding row exists for a user
CREATE OR REPLACE FUNCTION ensure_onboarding_row(uid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO member_onboarding (user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned) WHERE is_pinned = true;

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_onboarding ENABLE ROW LEVEL SECURITY;

-- Announcements policies: Members read published only
DROP POLICY IF EXISTS "Members can read published announcements" ON announcements;
CREATE POLICY "Members can read published announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Announcements policies: Mods/Admins read all (including drafts)
DROP POLICY IF EXISTS "Mods and admins can read all announcements" ON announcements;
CREATE POLICY "Mods and admins can read all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Announcements policies: Mods/Admins can insert
DROP POLICY IF EXISTS "Mods and admins can insert announcements" ON announcements;
CREATE POLICY "Mods and admins can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Announcements policies: Mods/Admins can update
DROP POLICY IF EXISTS "Mods and admins can update announcements" ON announcements;
CREATE POLICY "Mods and admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Announcements policies: Super admins can delete
DROP POLICY IF EXISTS "Super admins can delete announcements" ON announcements;
CREATE POLICY "Super admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Onboarding policies: Users read their own row
DROP POLICY IF EXISTS "Users can read own onboarding state" ON member_onboarding;
CREATE POLICY "Users can read own onboarding state"
  ON member_onboarding FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Onboarding policies: Users can insert their own row
DROP POLICY IF EXISTS "Users can insert own onboarding state" ON member_onboarding;
CREATE POLICY "Users can insert own onboarding state"
  ON member_onboarding FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Onboarding policies: Users can update their own row
DROP POLICY IF EXISTS "Users can update own onboarding state" ON member_onboarding;
CREATE POLICY "Users can update own onboarding state"
  ON member_onboarding FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Onboarding policies: Admins can read all (for analytics)
DROP POLICY IF EXISTS "Admins can read all onboarding states" ON member_onboarding;
CREATE POLICY "Admins can read all onboarding states"
  ON member_onboarding FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Seed initial announcements (idempotent)
INSERT INTO announcements (id, title, body, category, is_pinned, is_published, published_at, created_at)
VALUES 
  (
    'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
    'Welcome to TPC Member Area',
    'Welcome to the TPC Global Member Area! Here you can access exclusive updates, manage your profile, track your referral rewards, and stay connected with the community. Complete your onboarding checklist to unlock the full member experience.',
    'update',
    true,
    true,
    now(),
    now()
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002'::uuid,
    'Community Guidelines & Risk Notice',
    'TPC is an educational platform. All content is for informational purposes only and does not constitute financial advice. By participating, you acknowledge full personal responsibility for your decisions. Please review our legal docs and community rules to ensure a safe, respectful experience for all members.',
    'policy',
    false,
    true,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;