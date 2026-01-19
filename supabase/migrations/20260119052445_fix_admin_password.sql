/*
  # Fix Super Admin Password

  1. Updates the password for tpcglobal.io@gmail.com
  2. Uses proper Supabase-compatible password hashing
  3. Password: Admin123!
  
  Note: CHANGE PASSWORD immediately after first login!
*/

-- Update password using Supabase's auth functions
-- The password will be: Admin123!
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf', 10)),
  updated_at = NOW()
WHERE email = 'tpcglobal.io@gmail.com';
