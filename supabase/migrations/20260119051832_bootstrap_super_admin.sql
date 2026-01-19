/*
  # Bootstrap Super Admin Account

  1. Updates
    - Updates the profile for 'tpcglobal.io@gmail.com' to super_admin role
    - Grants full verification and invite permissions
    - Sets default referral code and username if not already set
  
  2. Security
    - This is a one-time bootstrap operation for the initial super admin
    - Only affects the specified email address
*/

-- Bootstrap super admin account
UPDATE public.profiles
SET
  role = 'super_admin',
  is_verified = true,
  can_invite = true,
  referral_code = COALESCE(referral_code, 'TPC-BOOT01'),
  username = COALESCE(username, 'tpcadmin')
WHERE email = 'tpcglobal.io@gmail.com';
