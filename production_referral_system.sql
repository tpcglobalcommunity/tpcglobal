-- PRODUCTION-READY REFERRAL SYSTEM
-- Menggunakan RPC untuk keamanan dan kontrol penuh

-- 1. Tabel referrals untuk tracking relasi
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, REWARDED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint untuk mencegah duplikasi
    UNIQUE(referrer_id, referred_id)
);

-- 2. Tambah kolom referred_by ke profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- 3. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON public.profiles(member_code);

-- 4. RPC Function untuk validasi dan proses referral
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_referral_code TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    referrer_id UUID,
    referrer_username TEXT,
    referrer_member_code TEXT
) AS $$
DECLARE
    v_referrer_id UUID;
    v_referrer_username TEXT;
    v_referrer_member_code TEXT;
BEGIN
    -- Cari user dengan member_code yang cocok
    SELECT id, username, member_code
    INTO v_referrer_id, v_referrer_username, v_referrer_member_code
    FROM public.profiles
    WHERE member_code = p_referral_code
    AND status = 'ACTIVE'
    LIMIT 1;
    
    -- Return hasil
    RETURN QUERY SELECT 
        (v_referrer_id IS NOT NULL) as is_valid,
        v_referrer_id as referrer_id,
        v_referrer_username as referrer_username,
        v_referrer_member_code as referrer_member_code;
        
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC Function untuk proses referral setelah signup
CREATE OR REPLACE FUNCTION public.process_referral_after_signup(
    p_new_user_id UUID,
    p_referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_referrer_id UUID;
    v_referral_exists BOOLEAN;
BEGIN
    -- Validasi referral code
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE member_code = p_referral_code
    AND status = 'ACTIVE'
    LIMIT 1;
    
    -- Jika referral tidak valid, return false
    IF v_referrer_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Cek apakah referral sudah pernah diproses
    SELECT EXISTS(
        SELECT 1 FROM public.referrals 
        WHERE referred_id = p_new_user_id
    ) INTO v_referral_exists;
    
    -- Jika sudah ada, jangan proses lagi
    IF v_referral_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Update profile baru dengan referred_by
    UPDATE public.profiles
    SET referred_by = v_referrer_id
    WHERE id = p_new_user_id;
    
    -- Insert ke tabel referrals
    INSERT INTO public.referrals (
        referrer_id,
        referred_id,
        referral_code,
        status
    ) VALUES (
        v_referrer_id,
        p_new_user_id,
        p_referral_code,
        'CONFIRMED'
    );
    
    -- Increment referral count
    UPDATE public.profiles
    SET referral_count = referral_count + 1
    WHERE id = v_referrer_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update trigger untuk memanggil RPC setelah signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_member_code TEXT;
    v_referral_code TEXT;
    v_referrer_id UUID;
BEGIN
    -- Generate member code unik
    v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
    
    -- Ambil referral code dari meta data
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    
    -- Cek validitas referral (RPC call)
    SELECT referrer_id INTO v_referrer_id
    FROM public.validate_referral_code(v_referral_code)
    WHERE is_valid = TRUE
    LIMIT 1;
    
    -- Insert ke profiles
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,  -- Kode upline dari form
        member_code,    -- Kode member baru auto-generated
        referred_by,    -- ID referrer
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
        'member',
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

    -- Proses referral tracking (async)
    PERFORM public.process_referral_after_signup(NEW.id, v_referral_code);
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies untuk keamanan
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policy: User bisa lihat referral miliknya
CREATE POLICY "Users can view own referrals"
    ON public.referrals FOR SELECT
    USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- Policy: System bisa insert referral (via RPC)
CREATE POLICY "Enable insert for all users"
    ON public.referrals FOR INSERT
    WITH CHECK (true);

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral_after_signup(UUID, TEXT) TO authenticated;
GRANT ALL ON public.referrals TO authenticated;
GRANT SELECT ON public.referrals TO anon;

-- 9. View untuk monitoring referral
CREATE OR REPLACE VIEW public.referral_stats AS
SELECT 
    p.id,
    p.username,
    p.member_code,
    p.referral_count,
    COUNT(r.id) as confirmed_referrals,
    SUM(CASE WHEN r.status = 'CONFIRMED' THEN 1 ELSE 0 END) as successful_referrals
FROM public.profiles p
LEFT JOIN public.referrals r ON p.id = r.referrer_id
GROUP BY p.id, p.username, p.member_code, p.referral_count;

GRANT SELECT ON public.referral_stats TO authenticated;
