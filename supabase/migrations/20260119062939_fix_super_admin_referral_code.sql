/*
  # Fix Super Admin Referral Code

  1. Updates
    - Ensure super admin has valid referral code
    - Set can_invite to true for super admin
    - Update referral_code to TPC-BOOT01 if needed

  2. Security
    - Only updates existing super admin account
    - Ensures invite functionality works properly
*/

-- Update super admin profile with valid referral code and can_invite
UPDATE profiles
SET 
  referral_code = 'TPC-BOOT01',
  can_invite = true,
  updated_at = now()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'tpcglobal.io@gmail.com'
)
AND role = 'super_admin';

-- Create a helper function to generate bootstrap referral codes if needed
CREATE OR REPLACE FUNCTION generate_bootstrap_invite()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_referral_code text;
BEGIN
  -- Get super admin ID
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'tpcglobal.io@gmail.com';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Super admin not found';
  END IF;

  -- Get their referral code
  SELECT referral_code INTO v_referral_code
  FROM profiles
  WHERE id = v_admin_id;

  -- Ensure can_invite is true
  UPDATE profiles
  SET can_invite = true,
      updated_at = now()
  WHERE id = v_admin_id;

  RETURN v_referral_code;
END;
$$;
