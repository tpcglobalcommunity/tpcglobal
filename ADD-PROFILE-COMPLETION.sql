-- ADD PROFILE COMPLETION SYSTEM
-- Add is_profile_complete column and update trigger

-- 1. Add is_profile_complete column if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Update existing profiles to set completion status
UPDATE public.profiles 
SET is_profile_complete = TRUE 
WHERE 
  full_name IS NOT NULL 
  AND username IS NOT NULL 
  AND email IS NOT NULL;

-- 3. Update trigger to handle profile completion
CREATE OR REPLACE FUNCTION public.final_recovery_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  -- INSERT MINIMALIS: Gunakan field yang benar dari frontend
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username, 
    role, 
    can_invite,
    referral_code,
    is_profile_complete
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'fullName', 'Member'),
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 5)),
    'member',
    true,
    COALESCE(new.raw_user_meta_data->>'referralCode', 'TPC-' || upper(substr(new.id::text, 1, 6))),
    FALSE -- Profile needs completion after signup
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Jika tetap gagal, biarkan user terbuat di auth.users tanpa profil
  -- (Aplikasi Anda punya MemberGuard yang bisa handle ini nanti)
  RETURN new; 
END;
$$;

-- 4. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_recovery ON auth.users;

CREATE TRIGGER on_auth_user_created_recovery
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.final_recovery_trigger();

-- 5. Verify the setup
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name = 'is_profile_complete';
