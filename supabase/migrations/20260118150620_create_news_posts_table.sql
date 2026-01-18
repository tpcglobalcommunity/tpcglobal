/*
  # Create News Posts Table

  1. New Table
    - `news_posts`
      - `id` (uuid, primary key)
      - `slug` (text, unique, url-safe identifier)
      - `category` (text, restricted values)
      - `title_en` (text, English title)
      - `excerpt_en` (text, English excerpt)
      - `content_en` (text, English content)
      - `title_id` (text, Indonesian title)
      - `excerpt_id` (text, Indonesian excerpt)
      - `content_id` (text, Indonesian content)
      - `cover_url` (text, optional cover image)
      - `is_pinned` (boolean, for featuring posts)
      - `is_published` (boolean, publish status)
      - `published_at` (timestamptz, publication date)
      - `created_by` (uuid, author reference)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, update timestamp)

  2. Indexes
    - Unique index on slug
    - Index on category for filtering
    - Index on is_published and published_at for queries
    - Index on is_pinned for featured posts

  3. Security
    - Enable RLS
    - Public users can read published posts only
    - Moderators/Admins/Super Admins can manage all posts
    - Admins can read drafts

  4. Triggers
    - Auto-update updated_at timestamp on modifications

  Important Notes:
    - Bilingual content stored in single table (EN/ID fields)
    - Category restricted to approved types
    - Published posts visible to public via RLS
    - Draft posts only visible to authorized users
*/

-- =====================================================
-- 1. CREATE NEWS_POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('education', 'update', 'release', 'policy', 'transparency')),
  
  -- English content
  title_en text NOT NULL,
  excerpt_en text NOT NULL,
  content_en text NOT NULL,
  
  -- Indonesian content
  title_id text NOT NULL,
  excerpt_id text NOT NULL,
  content_id text NOT NULL,
  
  -- Media and metadata
  cover_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  
  -- Author tracking
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Slug is already unique, but add explicit index
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts(category);

-- Published posts query optimization
CREATE INDEX IF NOT EXISTS idx_news_posts_published 
  ON news_posts(is_published, published_at DESC) 
  WHERE is_published = true;

-- Pinned posts
CREATE INDEX IF NOT EXISTS idx_news_posts_pinned 
  ON news_posts(is_pinned) 
  WHERE is_pinned = true;

-- Author lookup
CREATE INDEX IF NOT EXISTS idx_news_posts_created_by ON news_posts(created_by);

-- =====================================================
-- 3. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_news_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_news_posts_updated_at ON news_posts;
CREATE TRIGGER trigger_update_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_news_posts_updated_at();

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES FOR PUBLIC ACCESS
-- =====================================================

-- Public users (including anonymous) can read published posts
CREATE POLICY "Anyone can view published posts"
  ON news_posts FOR SELECT
  TO public
  USING (is_published = true);

-- Authenticated users can also view published posts
CREATE POLICY "Authenticated users can view published posts"
  ON news_posts FOR SELECT
  TO authenticated
  USING (is_published = true);

-- =====================================================
-- 6. RLS POLICIES FOR ADMIN ACCESS
-- =====================================================

-- Admins and moderators can view all posts (including drafts)
CREATE POLICY "Admins can view all posts"
  ON news_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Admins and moderators can create posts
CREATE POLICY "Admins can create posts"
  ON news_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Admins and moderators can update posts
CREATE POLICY "Admins can update posts"
  ON news_posts FOR UPDATE
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

-- Only admins and super_admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON news_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS FOR NEWS QUERIES
-- =====================================================

-- Get published news posts with filtering and pagination
CREATE OR REPLACE FUNCTION get_news_posts(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0,
  p_category text DEFAULT NULL,
  p_pinned_first boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  slug text,
  category text,
  title_en text,
  excerpt_en text,
  title_id text,
  excerpt_id text,
  cover_url text,
  is_pinned boolean,
  published_at timestamptz,
  created_by uuid,
  author_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.id,
    np.slug,
    np.category,
    np.title_en,
    np.excerpt_en,
    np.title_id,
    np.excerpt_id,
    np.cover_url,
    np.is_pinned,
    np.published_at,
    np.created_by,
    p.full_name as author_name,
    np.created_at
  FROM news_posts np
  LEFT JOIN profiles p ON np.created_by = p.id
  WHERE np.is_published = true
    AND (p_category IS NULL OR np.category = p_category)
  ORDER BY 
    CASE WHEN p_pinned_first THEN np.is_pinned ELSE false END DESC,
    np.published_at DESC NULLS LAST,
    np.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_news_posts TO anon, authenticated;

-- Get single news post by slug
CREATE OR REPLACE FUNCTION get_news_post_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  category text,
  title_en text,
  excerpt_en text,
  content_en text,
  title_id text,
  excerpt_id text,
  content_id text,
  cover_url text,
  is_pinned boolean,
  is_published boolean,
  published_at timestamptz,
  created_by uuid,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.id,
    np.slug,
    np.category,
    np.title_en,
    np.excerpt_en,
    np.content_en,
    np.title_id,
    np.excerpt_id,
    np.content_id,
    np.cover_url,
    np.is_pinned,
    np.is_published,
    np.published_at,
    np.created_by,
    p.full_name as author_name,
    np.created_at,
    np.updated_at
  FROM news_posts np
  LEFT JOIN profiles p ON np.created_by = p.id
  WHERE np.slug = p_slug
    AND np.is_published = true;
END;
$$;

GRANT EXECUTE ON FUNCTION get_news_post_by_slug TO anon, authenticated;

-- Admin function to get post by ID or slug (including drafts)
CREATE OR REPLACE FUNCTION admin_get_news_post(p_identifier text)
RETURNS TABLE (
  id uuid,
  slug text,
  category text,
  title_en text,
  excerpt_en text,
  content_en text,
  title_id text,
  excerpt_id text,
  content_id text,
  cover_url text,
  is_pinned boolean,
  is_published boolean,
  published_at timestamptz,
  created_by uuid,
  author_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role text;
BEGIN
  -- Check if caller is authorized
  SELECT role INTO caller_role
  FROM profiles
  WHERE id = auth.uid();
  
  IF caller_role NOT IN ('moderator', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Access denied. Moderator or higher role required.';
  END IF;

  RETURN QUERY
  SELECT 
    np.id,
    np.slug,
    np.category,
    np.title_en,
    np.excerpt_en,
    np.content_en,
    np.title_id,
    np.excerpt_id,
    np.content_id,
    np.cover_url,
    np.is_pinned,
    np.is_published,
    np.published_at,
    np.created_by,
    p.full_name as author_name,
    np.created_at,
    np.updated_at
  FROM news_posts np
  LEFT JOIN profiles p ON np.created_by = p.id
  WHERE np.slug = p_identifier
     OR np.id::text = p_identifier;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_news_post TO authenticated;

COMMENT ON TABLE news_posts IS 'News and updates posts with bilingual content (EN/ID). Supports categories, pinning, and draft/publish workflow.';
COMMENT ON FUNCTION get_news_posts IS 'Public function to retrieve published news posts with optional filtering and pagination.';
COMMENT ON FUNCTION get_news_post_by_slug IS 'Public function to retrieve a single published news post by slug.';
COMMENT ON FUNCTION admin_get_news_post IS 'Admin function to retrieve any news post (including drafts) by slug or ID.';
