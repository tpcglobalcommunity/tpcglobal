/*
  # Add tags support to news_posts table

  ## Changes
  1. New Columns
    - `tags` (text[]) - Array of tags for categorization and filtering
      - Default: empty array
      - NOT NULL constraint
      - Supports multi-tag classification
  
  2. Indexes
    - GIN index on tags for efficient array searches and queries
  
  ## Notes
  - Idempotent: Uses IF NOT EXISTS to prevent errors on re-run
  - No data loss: Only additive changes
  - RLS policies remain unchanged
  - Tags should be normalized (lowercase, trimmed) in application layer
*/

-- Add tags column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news_posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.news_posts
    ADD COLUMN tags text[] NOT NULL DEFAULT '{}'::text[];
  END IF;
END $$;

-- Add GIN index for efficient tag searches
CREATE INDEX IF NOT EXISTS news_posts_tags_gin
ON public.news_posts USING gin (tags);