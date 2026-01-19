/*
  # Fix Super Admin Login Credentials

  1. Updates password with correct bcrypt format
  2. Ensures all auth fields are properly set
  3. Password: Admin123!
  
  This uses the exact same password hashing that Supabase uses internally.
*/

-- Update user with proper password and ensure all fields are correct
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin123!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  confirmation_token = '',
  recovery_token = '',
  email_change_token_current = '',
  email_change = '',
  updated_at = NOW(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = '{}'::jsonb,
  is_sso_user = false
WHERE email = 'tpcglobal.io@gmail.com';

-- Update identity to ensure it's properly linked
UPDATE auth.identities
SET
  identity_data = jsonb_build_object(
    'sub', (SELECT id::text FROM auth.users WHERE email = 'tpcglobal.io@gmail.com'),
    'email', 'tpcglobal.io@gmail.com',
    'email_verified', true,
    'phone_verified', false
  ),
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE provider_id = 'tpcglobal.io@gmail.com' AND provider = 'email';
