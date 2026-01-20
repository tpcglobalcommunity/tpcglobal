-- UPDATE TRIGGER handle_new_user UNTUK INTEGRASI REFERRAL SYSTEM
-- Compatible dengan existing production referral system

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0;

-- 2. Update trigger untuk generate member_code dan proses referral
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_member_code TEXT;
    v_referral_code TEXT;
    v_referrer_id UUID;
BEGIN
    -- Generate member code unik
    v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
    
    -- Ambil dan clean referral code dari meta data
    v_referral_code := UPPER(TRIM(NEW.raw_user_meta_data->>'referral_code'));
    
    -- Validasi referral code dan dapatkan referrer ID
    SELECT referrer_id INTO v_referrer_id
    FROM public.validate_referral_code_public(v_referral_code)
    WHERE is_valid = TRUE
    LIMIT 1;
    
    -- Insert ke profiles dengan semua data lengkap
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,  -- Kode upline dari form
        member_code,    -- Kode member baru auto-generated
        referred_by,    -- ID referrer (jika valid)
        role,
        status,
        referral_count,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        v_referral_code,
        v_member_code,
        v_referrer_id,
        'MEMBER',
        'PENDING',
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        referral_code = EXCLUDED.referral_code,
        member_code = EXCLUDED.member_code,
        referred_by = EXCLUDED.referred_by,
        updated_at = NOW();
    
    -- Proses referral tracking (async via RPC)
    IF v_referrer_id IS NOT NULL THEN
        PERFORM public.process_referral_after_signup(NEW.id, v_referral_code);
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error tapi tidak gagalkan auth (anti-500)
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Pastikan trigger ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verifikasi setup
SELECT 
    'handle_new_user trigger updated with referral system' as status,
    NOW() as updated_at;

-- 5. Test query untuk validasi
SELECT 
    proname as function_name,
    prosrc as source_code
FROM pg_proc 
WHERE proname = 'handle_new_user';
