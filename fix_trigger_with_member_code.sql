-- ANALISIS DAN PERBAIKAN TRIGGER BERDASARKAN YANG SUDAH ADA
-- Masalah: Trigger tidak menghasilkan member_code, hanya insert referral_code

-- 1. Cek apakah kolom member_code sudah ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE;

-- 2. Update trigger untuk menghasilkan member_code otomatis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_member_code TEXT;
    v_referral_code TEXT;
BEGIN
    -- Generate member code unik
    v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
    
    -- Ambil referral code dari meta data
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Insert ke profiles dengan member_code dan referral_code
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,  -- Kode upline dari form
        member_code,    -- Kode member baru auto-generated
        role,
        status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        v_referral_code,
        v_member_code,
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
EXCEPTION WHEN OTHERS THEN
    -- Log error tapi tidak gagalkan auth
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Pastikan trigger ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Function validasi referral (cek ke member_code yang ada)
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE member_code = p_code 
        AND status = 'ACTIVE'
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 6. Test query untuk verifikasi
SELECT 'Trigger updated successfully' as status;

-- 7. Cek struktur akhir
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('id', 'email', 'username', 'referral_code', 'member_code', 'role', 'status')
ORDER BY ordinal_position;
