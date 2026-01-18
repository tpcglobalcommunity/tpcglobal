/*
  # Create Member Directory System - Privacy First + Opt-In

  1. Profile Table Enhancements
    - `show_in_directory` (boolean, default false) - Opt-in visibility toggle
    - `bio` (text, nullable, max 160 chars) - Short member bio
    - `country` (text, nullable, max 60 chars) - Member country

  2. Composite Type
    - `directory_member_item` - Safe public fields for directory listing
      - username, full_name, avatar_url, role, is_verified, created_at, bio, country

  3. RPC Functions
    - `update_directory_settings()` - Update user's directory preferences (SECURITY DEFINER)
    - `get_member_directory()` - Get paginated, searchable directory listing (SECURITY DEFINER)
    - `get_public_profile_by_username()` - Get safe public profile (SECURITY DEFINER, public)

  4. Security
    - Directory is OPT-IN: show_in_directory defaults to false
    - Only safe fields exposed (NO email, NO user_id, NO referral codes)
    - RLS enforced - no direct wide table reads
    - Public profile returns NULL if user opted out
    - Users can only update their own directory settings

  5. Important Notes
    - Privacy-first design: members control visibility
    - All directory queries through secure RPCs
    - Search by username/full_name (case-insensitive)
    - Ordered by: verified status, role priority, join date
*/

-- Add directory columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'show_in_directory'
  ) THEN
    ALTER TABLE profiles ADD COLUMN show_in_directory boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text NULL;
  END IF;
END $$;

-- Add constraints for bio and country length
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_length_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length_check CHECK (length(bio) <= 160);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_country_length_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_country_length_check CHECK (length(country) <= 60);
  END IF;
END $$;

-- Create composite type for directory member items
DROP TYPE IF EXISTS directory_member_item CASCADE;

CREATE TYPE directory_member_item AS (
  username text,
  full_name text,
  avatar_url text,
  role text,
  is_verified boolean,
  created_at timestamptz,
  bio text,
  country text
);

-- Create RPC to update directory settings (user can only update their own)
CREATE OR REPLACE FUNCTION update_directory_settings(
  p_show boolean,
  p_bio text DEFAULT NULL,
  p_country text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_bio text;
  v_country text;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Trim and validate inputs
  v_bio := TRIM(p_bio);
  v_country := TRIM(p_country);

  -- Enforce length limits
  IF v_bio IS NOT NULL AND LENGTH(v_bio) > 160 THEN
    RAISE EXCEPTION 'Bio must be 160 characters or less';
  END IF;

  IF v_country IS NOT NULL AND LENGTH(v_country) > 60 THEN
    RAISE EXCEPTION 'Country must be 60 characters or less';
  END IF;

  -- Update only directory-related fields for current user
  UPDATE profiles
  SET 
    show_in_directory = p_show,
    bio = NULLIF(v_bio, ''),
    country = NULLIF(v_country, ''),
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Return updated settings
  RETURN json_build_object(
    'show_in_directory', p_show,
    'bio', NULLIF(v_bio, ''),
    'country', NULLIF(v_country, '')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_directory_settings(boolean, text, text) TO authenticated;

-- Create RPC to get member directory (paginated, searchable)
CREATE OR REPLACE FUNCTION get_member_directory(
  p_query text DEFAULT NULL,
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  username text,
  full_name text,
  avatar_url text,
  role text,
  is_verified boolean,
  created_at timestamptz,
  bio text,
  country text,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_search text;
BEGIN
  -- Verify user is authenticated
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Normalize search query
  v_search := LOWER(TRIM(COALESCE(p_query, '')));

  -- Return directory listing with total count
  RETURN QUERY
  WITH filtered AS (
    SELECT 
      p.username,
      p.full_name,
      p.avatar_url,
      p.role,
      p.is_verified,
      p.created_at,
      p.bio,
      p.country,
      -- Role priority for sorting
      CASE p.role
        WHEN 'super_admin' THEN 4
        WHEN 'admin' THEN 3
        WHEN 'moderator' THEN 2
        ELSE 1
      END as role_priority
    FROM profiles p
    WHERE p.show_in_directory = true
      AND (
        v_search = '' 
        OR LOWER(p.username) LIKE '%' || v_search || '%'
        OR LOWER(p.full_name) LIKE '%' || v_search || '%'
      )
  ),
  counted AS (
    SELECT COUNT(*) as total FROM filtered
  )
  SELECT 
    f.username,
    f.full_name,
    f.avatar_url,
    f.role,
    f.is_verified,
    f.created_at,
    f.bio,
    f.country,
    c.total
  FROM filtered f
  CROSS JOIN counted c
  ORDER BY 
    f.is_verified DESC,
    f.role_priority DESC,
    f.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_member_directory(text, integer, integer) TO authenticated;

-- Create RPC to get public profile by username (public-safe)
CREATE OR REPLACE FUNCTION get_public_profile_by_username(p_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile json;
  v_username text;
BEGIN
  -- Normalize username to lowercase
  v_username := LOWER(TRIM(p_username));

  -- Get profile if show_in_directory is true
  SELECT json_build_object(
    'username', p.username,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'role', p.role,
    'is_verified', p.is_verified,
    'created_at', p.created_at,
    'bio', p.bio,
    'country', p.country
  )
  INTO v_profile
  FROM profiles p
  WHERE LOWER(p.username) = v_username
    AND p.show_in_directory = true;

  -- Return NULL if not found or opted out (privacy)
  RETURN v_profile;
END;
$$;

-- Grant to both authenticated and anonymous (public access)
GRANT EXECUTE ON FUNCTION get_public_profile_by_username(text) TO authenticated, anon;

-- Create index for directory queries (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_directory_listing 
ON profiles(show_in_directory, is_verified DESC, role, created_at DESC) 
WHERE show_in_directory = true;

-- Create index for username lookup (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON profiles(LOWER(username));

-- Create index for full_name search (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_lower 
ON profiles(LOWER(full_name));