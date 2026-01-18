/*
  # Add missing columns to announcements table

  1. Changes
    - Add `category` column with constraint
    - Add `published_at` column for tracking first publication

  2. Notes
    - Uses DO block for idempotent column additions
    - Existing announcements will get default category 'general'
*/

-- Add category column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'category'
  ) THEN
    ALTER TABLE announcements ADD COLUMN category text NOT NULL DEFAULT 'general';
    ALTER TABLE announcements ADD CONSTRAINT announcements_category_check 
      CHECK (category IN ('general', 'update', 'policy', 'security', 'release'));
  END IF;
END $$;

-- Add published_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE announcements ADD COLUMN published_at timestamptz;
  END IF;
END $$;