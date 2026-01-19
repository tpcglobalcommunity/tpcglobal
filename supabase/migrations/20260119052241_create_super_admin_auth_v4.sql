/*
  # Create Super Admin Auth Account v4

  1. New User
    - Creates auth.users entry for tpcglobal.io@gmail.com
    - Sets password to 'Admin123!' (change after first login)
    - Confirms email automatically
  
  2. Profile Setup
    - Creates profile with super_admin role
    - Sets verified and invite permissions
    - Assigns default username and referral code
  
  3. Security
    - Initial password MUST be changed after first login
    - Email is pre-verified for immediate access
    
  Note: Default password is 'Admin123!' - CHANGE IMMEDIATELY after first login
*/

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'tpcglobal.io@gmail.com';
  
  -- If user doesn't exist, create it
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'tpcglobal.io@gmail.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW()
    );
    
    -- Create identity entry
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      'tpcglobal.io@gmail.com',
      new_user_id,
      format('{"sub":"%s","email":"%s"}', new_user_id::text, 'tpcglobal.io@gmail.com')::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    role,
    is_verified,
    can_invite,
    referral_code,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'tpcglobal.io@gmail.com',
    'tpcadmin',
    'super_admin',
    true,
    true,
    'TPC-ADMIN',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    role = 'super_admin',
    is_verified = true,
    can_invite = true,
    username = COALESCE(EXCLUDED.username, profiles.username),
    referral_code = COALESCE(EXCLUDED.referral_code, profiles.referral_code);
    
END $$;
