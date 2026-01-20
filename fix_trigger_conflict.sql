-- Fix trigger conflict - drop existing trigger lalu recreate
-- Jalankan ini di Supabase SQL Editor

-- 1) Drop trigger yang ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2) Drop function yang ada
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3) Create function baru
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert user ke profiles table dengan data dari auth.users
  INSERT INTO public.profiles (
    id,
    email,
    username,
    referral_code,
    role,
    verified,
    can_invite,
    status,
    full_name,
    telegram,
    phone,
    city,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NEW.raw_user_meta_data->>'referral_code',
    'member',
    false,
    false,
    'PENDING',
    NULL,  -- akan diisi setelah login
    NULL,  -- akan diisi setelah login  
    NULL,  -- akan diisi setelah login
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 4) Create trigger baru
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
