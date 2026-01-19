/*
  # Ensure Super Admin Profile is Complete

  1. Checks and Creates
    - Ensure super admin profile exists in profiles table
    - Set all required fields for super admin
    - Ensure referral code is set and can_invite is true

  2. Notes
    - Uses INSERT ... ON CONFLICT to ensure idempotency
    - Sets sensible defaults for super admin profile
*/

-- Ensure super admin profile exists with all required fields
INSERT INTO profiles (
  id,
  email,
  full_name,
  username,
  role,
  is_verified,
  can_invite,
  referral_code,
  show_in_directory,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'Super Admin',
  'superadmin',
  'super_admin',
  true,
  true,
  'TPC-BOOT01',
  false,
  now(),
  now()
FROM auth.users u
WHERE u.email = 'tpcglobal.io@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET
  role = 'super_admin',
  is_verified = true,
  can_invite = true,
  referral_code = COALESCE(NULLIF(profiles.referral_code, ''), 'TPC-BOOT01'),
  full_name = COALESCE(NULLIF(profiles.full_name, ''), 'Super Admin'),
  username = COALESCE(NULLIF(profiles.username, ''), 'superadmin'),
  updated_at = now();

-- Verify the update
DO $$
DECLARE
  v_profile_count int;
  v_can_invite bool;
  v_referral_code text;
BEGIN
  SELECT COUNT(*), MAX(can_invite::int)::bool, MAX(referral_code)
  INTO v_profile_count, v_can_invite, v_referral_code
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE u.email = 'tpcglobal.io@gmail.com';

  IF v_profile_count = 0 THEN
    RAISE EXCEPTION 'Super admin profile not created';
  END IF;

  IF NOT v_can_invite THEN
    RAISE WARNING 'Super admin can_invite is false';
  END IF;

  IF v_referral_code IS NULL OR v_referral_code = '' THEN
    RAISE WARNING 'Super admin referral_code is empty';
  END IF;

  RAISE NOTICE 'Super admin profile verified: can_invite=%, referral_code=%', v_can_invite, v_referral_code;
END $$;
