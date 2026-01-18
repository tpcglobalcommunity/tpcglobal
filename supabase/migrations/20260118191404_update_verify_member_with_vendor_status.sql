/*
  # Update verify_member RPC with Vendor Status

  1. Updates
    - Update `verify_member()` to include vendor_status
    - Add trust badge information for verification display

  2. Security
    - Still SECURITY DEFINER and public-safe
    - No sensitive data exposed
    - Public access maintained

  3. Important Notes
    - Enables trust badges on verification page
    - Consistent with trust badge system
    - Server-enforced trust information
*/

-- Drop and recreate verify_member with vendor_status
DROP FUNCTION IF EXISTS verify_member(text);

CREATE OR REPLACE FUNCTION verify_member(identifier text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_user_id uuid;
  v_vendor_status text;
BEGIN
  -- Find user by referral_code or username (case-insensitive)
  SELECT id INTO v_user_id
  FROM profiles
  WHERE 
    LOWER(referral_code) = LOWER(TRIM(identifier))
    OR LOWER(username) = LOWER(TRIM(identifier))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Determine vendor status (only show approved in public verification)
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = v_user_id AND status = 'approved'
      ) THEN 'approved'
      ELSE 'none'
    END
  INTO v_vendor_status;

  -- Return safe verification data
  SELECT json_build_object(
    'username', p.username,
    'full_name', p.full_name,
    'role', p.role,
    'is_verified', p.is_verified,
    'created_at', p.created_at,
    'avatar_url', p.avatar_url,
    'referral_code', p.referral_code,
    'vendor_status', v_vendor_status
  )
  INTO v_result
  FROM profiles p
  WHERE p.id = v_user_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_member(text) TO anon, authenticated;