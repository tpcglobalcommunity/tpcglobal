/*
  # Update News RPC Functions to Include Tags

  ## Changes
  1. Drop existing functions
    - get_news_posts
    - get_news_post_by_slug
    - admin_get_news_post
  
  2. Recreate functions with tags field
    - Add tags to return table definitions
    - Add tags to SELECT statements
  
  ## Notes
  - This migration drops and recreates RPC functions to include tags array
  - All existing functionality is preserved
  - Grants are reapplied after recreation
*/

-- =====================================================
-- 1. DROP EXISTING FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS get_news_posts(integer, integer, text, boolean);
DROP FUNCTION IF EXISTS get_news_post_by_slug(text);
DROP FUNCTION IF EXISTS admin_get_news_post(text);

-- =====================================================
-- 2. RECREATE get_news_posts WITH TAGS
-- =====================================================

CREATE FUNCTION get_news_posts(
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
  tags text[],
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
    np.tags,
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

-- =====================================================
-- 3. RECREATE get_news_post_by_slug WITH TAGS
-- =====================================================

CREATE FUNCTION get_news_post_by_slug(p_slug text)
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
  tags text[],
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
    np.tags,
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

-- =====================================================
-- 4. RECREATE admin_get_news_post WITH TAGS
-- =====================================================

CREATE FUNCTION admin_get_news_post(p_identifier text)
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
  tags text[],
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
    np.tags,
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