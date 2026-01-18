/*
  # Create Safe Referral Analytics RPC

  1. Composite Type
    - `member_referral_item` - Safe fields only for displaying invited members
      - `username` (text) - Public username
      - `full_name` (text) - Display name
      - `avatar_url` (text) - Profile picture URL
      - `joined_at` (timestamptz) - When they joined
      - `is_verified` (boolean) - Verification status

  2. RPC Function
    - `get_my_referral_analytics()` - SECURITY DEFINER
    - Returns comprehensive referral data for the current user
    - Returns:
      - my_referral_code (text)
      - my_referral_count (integer)
      - can_invite (boolean)
      - referred_by (text, nullable) - Username of person who referred them
      - invited_last_7_days (integer)
      - invited_last_30_days (integer)
      - recent_invites (member_referral_item array)

  3. Security
    - Only accessible by authenticated users
    - Users can only see their own referral data
    - NO email addresses exposed
    - NO raw user IDs exposed to client
    - All data filtered server-side

  4. Important Notes
    - This is a privacy-safe RPC that never exposes sensitive data
    - Growth metrics (7-day, 30-day) help members track their invite success
    - Recent invites limited to last 50 for performance
    - Sorted by join date descending (newest first)
*/

-- Drop existing type if it exists
DROP TYPE IF EXISTS member_referral_item CASCADE;

-- Create composite type for safe referral items
CREATE TYPE member_referral_item AS (
  username text,
  full_name text,
  avatar_url text,
  joined_at timestamptz,
  is_verified boolean
);

-- Create safe referral analytics RPC
CREATE OR REPLACE FUNCTION get_my_referral_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_my_code text;
  v_my_count int;
  v_can_invite boolean;
  v_referred_by text;
  v_last_7_days int;
  v_last_30_days int;
  v_recent_invites json;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current user's referral info
  SELECT 
    referral_code,
    referral_count,
    can_invite
  INTO 
    v_my_code,
    v_my_count,
    v_can_invite
  FROM profiles
  WHERE id = v_user_id;

  -- Get referrer's username (who referred me)
  SELECT p.username
  INTO v_referred_by
  FROM profiles me
  JOIN profiles p ON p.id = me.referred_by
  WHERE me.id = v_user_id;

  -- Count invites in last 7 days
  SELECT COUNT(*)
  INTO v_last_7_days
  FROM referrals r
  JOIN profiles p ON p.id = r.referred_user_id
  WHERE r.referrer_id = v_user_id
    AND p.created_at >= NOW() - INTERVAL '7 days';

  -- Count invites in last 30 days
  SELECT COUNT(*)
  INTO v_last_30_days
  FROM referrals r
  JOIN profiles p ON p.id = r.referred_user_id
  WHERE r.referrer_id = v_user_id
    AND p.created_at >= NOW() - INTERVAL '30 days';

  -- Get recent invites (last 50, safe fields only)
  SELECT json_agg(
    json_build_object(
      'username', p.username,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'joined_at', p.created_at,
      'is_verified', p.is_verified
    ) ORDER BY p.created_at DESC
  )
  INTO v_recent_invites
  FROM referrals r
  JOIN profiles p ON p.id = r.referred_user_id
  WHERE r.referrer_id = v_user_id
  ORDER BY p.created_at DESC
  LIMIT 50;

  -- Return comprehensive analytics
  RETURN json_build_object(
    'my_referral_code', v_my_code,
    'my_referral_count', COALESCE(v_my_count, 0),
    'can_invite', COALESCE(v_can_invite, false),
    'referred_by', v_referred_by,
    'invited_last_7_days', COALESCE(v_last_7_days, 0),
    'invited_last_30_days', COALESCE(v_last_30_days, 0),
    'recent_invites', COALESCE(v_recent_invites, '[]'::json)
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_my_referral_analytics() TO authenticated;

-- Optional: Create a leaderboard function for admins (aggregate, safe)
CREATE OR REPLACE FUNCTION get_referral_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE (
  username text,
  full_name text,
  avatar_url text,
  referral_count integer,
  is_verified boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_role text;
BEGIN
  -- Get current user and role
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = v_user_id;

  -- Only admin and staff can view leaderboard
  IF v_user_role NOT IN ('admin', 'staff') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Return top referrers (safe fields only)
  RETURN QUERY
  SELECT 
    p.username,
    p.full_name,
    p.avatar_url,
    p.referral_count,
    p.is_verified
  FROM profiles p
  WHERE p.referral_count > 0
  ORDER BY p.referral_count DESC, p.created_at ASC
  LIMIT p_limit;
END;
$$;

-- Grant execute to authenticated users (function checks role internally)
GRANT EXECUTE ON FUNCTION get_referral_leaderboard(integer) TO authenticated;