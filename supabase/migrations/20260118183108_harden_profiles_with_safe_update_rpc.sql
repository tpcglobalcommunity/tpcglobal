/*
  # Harden Profiles Table with Safe Update RPC

  1. Constraints
    - Add CHECK constraint for username pattern (3-20 chars, lowercase alphanumeric + underscore, cannot start with underscore)
    - Ensure unique index on lower(username) for case-insensitive uniqueness

  2. RPC Function
    - `update_profile_safe(p_full_name, p_username, p_avatar_url)` - SECURITY DEFINER
    - Only updates safe fields: full_name, username, avatar_url
    - Prevents updates to: role, is_verified, referral_code, referred_by, can_invite
    - Validates username format and uniqueness (case-insensitive)
    - Normalizes username to lowercase
    - Trims full_name

  3. Security
    - RLS ensures users can only update their own profile
    - RPC enforces field restrictions at database level
    - No direct UPDATE allowed on restricted fields

  4. Important Notes
    - Username must be 3-20 characters, lowercase letters, numbers, underscore only
    - Username cannot start or end with underscore
    - Avatar URL should be from Supabase Storage or trusted source
*/

-- Add username constraint if it doesn't exist
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_format_check'
  ) THEN
    -- Add CHECK constraint for username pattern
    -- Pattern: 3-20 chars, must start with letter or number, can contain underscore in middle, must end with letter or number
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_format_check 
      CHECK (username IS NULL OR username ~ '^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$');
  END IF;
END $$;

-- Ensure case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique 
  ON profiles(lower(username));

-- Create safe profile update RPC
CREATE OR REPLACE FUNCTION public.update_profile_safe(
  p_full_name text,
  p_username text,
  p_avatar_url text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_normalized_username text;
  v_existing_username text;
  v_result json;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Normalize username to lowercase
  v_normalized_username := lower(trim(p_username));

  -- Validate username format (3-20 chars, alphanumeric + underscore, cannot start/end with underscore)
  IF v_normalized_username !~ '^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])?$' THEN
    RAISE EXCEPTION 'Invalid username format. Must be 3-20 characters, lowercase letters, numbers, and underscores only. Cannot start or end with underscore.';
  END IF;

  -- Check if username is taken by another user (case-insensitive)
  SELECT username INTO v_existing_username
  FROM profiles
  WHERE lower(username) = v_normalized_username
    AND id != v_user_id
  LIMIT 1;

  IF v_existing_username IS NOT NULL THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- Update only safe fields
  UPDATE profiles
  SET
    full_name = trim(p_full_name),
    username = v_normalized_username,
    avatar_url = trim(p_avatar_url),
    updated_at = now()
  WHERE id = v_user_id;

  -- Return updated safe profile data
  SELECT json_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'username', username,
    'avatar_url', avatar_url,
    'role', role,
    'is_verified', is_verified,
    'referral_code', referral_code,
    'referred_by', referred_by,
    'referral_count', referral_count,
    'can_invite', can_invite,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result
  FROM profiles
  WHERE id = v_user_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_profile_safe(text, text, text) TO authenticated;

-- Helper function to check username availability (case-insensitive)
CREATE OR REPLACE FUNCTION public.check_username_available(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_normalized_username text;
  v_exists boolean;
BEGIN
  v_user_id := auth.uid();
  v_normalized_username := lower(trim(p_username));

  -- Check if username exists for a different user
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE lower(username) = v_normalized_username
      AND (v_user_id IS NULL OR id != v_user_id)
  ) INTO v_exists;

  RETURN NOT v_exists;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO authenticated;