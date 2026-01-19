/*
  # Create Admin User with Trigger Support

  1. Creates admin user (trigger will auto-create profile)
  2. Updates the auto-created profile with admin settings
  3. Email: tpcglobal.io@gmail.com
  4. Password: admin123
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert user (this will trigger profile creation)
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
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_current,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'tpcglobal.io@gmail.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"TPC Administrator","username":"tpcadmin","referral_code":"TPC-ADMIN"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    ''
  );
  
  -- Create identity
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
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'tpcglobal.io@gmail.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );
  
  -- Update the auto-created profile with admin settings
  UPDATE public.profiles 
  SET
    username = 'tpcadmin',
    full_name = 'TPC Administrator',
    role = 'super_admin',
    is_verified = true,
    can_invite = true,
    referral_code = 'TPC-ADMIN'
  WHERE id = new_user_id;
  
  RAISE NOTICE 'Admin user created with ID: %', new_user_id;
  
END $$;
