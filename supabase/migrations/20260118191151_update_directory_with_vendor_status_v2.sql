/*
  # Update Member Directory to Include Vendor Status

  1. Updates
    - Drop and recreate `get_member_directory()` RPC to include vendor_status
    - Drop and recreate `get_public_profile_by_username()` RPC to include vendor_status
    - Add vendor_status field to directory results

  2. Security
    - Vendor status derived from vendor_applications (same as get_trust_snapshot)
    - Only 'approved' shown in public directory (privacy)
    - Full vendor status available in member directory

  3. Important Notes
    - Consistent with trust badge system
    - Server-enforced vendor status
    - No client-side spoofing possible
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS get_member_directory(text, integer, integer);
DROP FUNCTION IF EXISTS get_public_profile_by_username(text);

-- Recreate get_member_directory with vendor_status
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
  vendor_status text,
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
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.role,
      p.is_verified,
      p.created_at,
      p.bio,
      p.country,
      -- Determine vendor status (only show approved in directory)
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM vendor_applications 
          WHERE user_id = p.id AND status = 'approved'
        ) THEN 'approved'
        ELSE 'none'
      END as vendor_status,
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
    f.vendor_status,
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

-- Recreate get_public_profile_by_username with vendor_status
CREATE OR REPLACE FUNCTION get_public_profile_by_username(p_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile json;
  v_username text;
  v_user_id uuid;
  v_vendor_status text;
BEGIN
  -- Normalize username to lowercase
  v_username := LOWER(TRIM(p_username));

  -- Get user_id
  SELECT id INTO v_user_id
  FROM profiles
  WHERE LOWER(username) = v_username
    AND show_in_directory = true;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Determine vendor status (only show approved)
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = v_user_id AND status = 'approved'
      ) THEN 'approved'
      ELSE 'none'
    END
  INTO v_vendor_status;

  -- Get profile
  SELECT json_build_object(
    'username', p.username,
    'full_name', p.full_name,
    'avatar_url', p.avatar_url,
    'role', p.role,
    'is_verified', p.is_verified,
    'created_at', p.created_at,
    'bio', p.bio,
    'country', p.country,
    'vendor_status', v_vendor_status
  )
  INTO v_profile
  FROM profiles p
  WHERE p.id = v_user_id;

  RETURN v_profile;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_profile_by_username(text) TO authenticated, anon;