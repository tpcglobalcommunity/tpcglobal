-- MINIMAL UPDATE: Tambah member_code generation ke trigger existing
-- Tetap menjaga flow yang sudah berjalan

-- 1. Pastikan kolom member_code ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE;

-- 2. Update trigger dengan tambahan member_code saja
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    referral_code,
    member_code,  -- Tambah member_code auto-generated
    role,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    UPPER(TRIM(NEW.raw_user_meta_data->>'referral_code')),
    'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6)), -- Auto-generate member code
    'MEMBER',
    'PENDING'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Anti Error 500: auth tetap sukses walau profile insert gagal
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Pastikan trigger ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Test query untuk verifikasi
SELECT 
    'handle_new_user updated with member_code generation' as status,
    NOW() as updated_at;

-- 5. Cek apakah trigger berfungsi
SELECT 
    tgname as trigger_name,
    pg_get_triggerdef(oid, true) as definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
