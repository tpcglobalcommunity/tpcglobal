-- ANALISIS DAN PERBAIKAN SIGNUP FLOW
-- Masalah: Bentrok antara referral_code (input user) dan member_code (generated)

-- 1. Pastikan struktur tabel profiles benar
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS referral_code TEXT, -- Kode referral dari upline (input user)
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE; -- Kode member unik (auto-generated)

-- 2. Drop trigger lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Fungsi trigger yang benar (memisahkan referral dan member code)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_member_code TEXT;
BEGIN
  -- Ambil referral code dari meta data (input user)
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Generate member code unik untuk user baru
  v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
  
  -- Insert ke profiles dengan kedua kode
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    referral_code,  -- Kode upline
    member_code,    -- Kode member baru
    role, 
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    v_referral_code,  -- Referral dari form
    v_member_code,    -- Member code generated
    'member',
    'PENDING',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    referral_code = EXCLUDED.referral_code,
    member_code = EXCLUDED.member_code,
    updated_at = NOW();
    
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log error tapi tidak gagalkan auth
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Buat trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Function untuk validasi referral code (public)
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Cek apakah referral code ada di tabel profiles sebagai member_code
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE member_code = p_code 
    AND status = 'ACTIVE'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permission ke public
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 7. Verifikasi struktur
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
