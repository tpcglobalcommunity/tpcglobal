-- =========================================================
-- SIMPLE SET PROFILE SYSTEM
-- set_profile_username_and_referral() - clean & simple
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Simple function untuk set username dan referral
CREATE OR REPLACE FUNCTION public.set_profile_username_and_referral(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    member_code TEXT,
    referral_valid BOOLEAN,
    referrer_username TEXT,
    profile_updated BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
    v_referrer_id UUID;
    v_referrer_username TEXT;
    v_referral_valid BOOLEAN;
    v_profile_updated BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            NULL as member_code,
            FALSE as referral_valid,
            NULL as referrer_username,
            FALSE as profile_updated;
        RETURN;
    END IF;
    
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_existing_profile;
    
    -- Jika belum ada profile, buat dulu
    IF NOT v_existing_profile THEN
        -- Get email dari auth.users
        DECLARE
            v_email TEXT;
        BEGIN
            SELECT email INTO v_email
            FROM auth.users 
            WHERE id = v_user_id;
            
            -- Generate member code
            v_member_code := 'TPC-' || UPPER(substr(md5(v_user_id || random()::text), 1, 6));
            
            -- Buat profile basic
            INSERT INTO public.profiles (
                id,
                email,
                member_code,
                role,
                status,
                referral_count,
                is_profile_complete,
                created_at,
                updated_at
            ) VALUES (
                v_user_id,
                v_email,
                v_member_code,
                'MEMBER',
                'PENDING',
                0,
                FALSE,
                NOW(),
                NOW()
            );
        END;
    ELSE
        -- Get existing member_code
        SELECT member_code INTO v_member_code
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;
    
    -- Validate referral code jika ada
    v_referral_valid := FALSE;
    v_referrer_id := NULL;
    v_referrer_username := NULL;
    
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT referrer_id, referrer_username INTO v_referrer_id, v_referrer_username
        FROM public.validate_referral_code_public(p_referral_code)
        WHERE is_valid = TRUE
        LIMIT 1;
        
        v_referral_valid := (v_referrer_id IS NOT NULL);
        
        -- Process referral jika valid
        IF v_referral_valid THEN
            -- Insert referral tracking
            INSERT INTO public.referrals (
                referrer_id,
                referred_id,
                referral_code,
                status
            ) VALUES (
                v_referrer_id,
                v_user_id,
                p_referral_code,
                'CONFIRMED'
            )
            ON CONFLICT (referrer_id, referred_id) DO NOTHING;
            
            -- Increment referrer count
            UPDATE public.profiles
            SET referral_count = referral_count + 1
            WHERE id = v_referrer_id
            AND NOT EXISTS (
                SELECT 1 FROM public.referrals 
                WHERE referrer_id = v_referrer_id 
                AND referred_id = v_user_id
            );
        END IF;
    END IF;
    
    -- Update profile dengan username dan referral
    UPDATE public.profiles
    SET 
        username = p_username,
        referral_code = p_referral_code,
        referred_by = v_referrer_id,
        is_profile_complete = TRUE,
        status = CASE 
            WHEN v_referral_valid THEN 'ACTIVE'
            ELSE 'ACTIVE'
        END,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    v_profile_updated := TRUE;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile updated successfully' as message,
        v_member_code as member_code,
        v_referral_valid as referral_valid,
        v_referrer_username as referrer_username,
        v_profile_updated as profile_updated;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error updating profile: ' || SQLERRM as message,
        NULL as member_code,
        FALSE as referral_valid,
        NULL as referrer_username,
        FALSE as profile_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Simple function untuk get profile info
CREATE OR REPLACE FUNCTION public.get_profile_info()
RETURNS TABLE (
    has_profile BOOLEAN,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referral_count INTEGER,
    is_complete BOOLEAN,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as has_profile,
        p.username,
        p.member_code,
        p.referral_code,
        p.referral_count,
        p.is_profile_complete,
        p.status
    FROM public.profiles p
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT 
        FALSE as has_profile,
        NULL as username,
        NULL as member_code,
        NULL as referral_code,
        0 as referral_count,
        FALSE as is_complete,
        'NO_PROFILE' as status
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.set_profile_username_and_referral(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 5. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- 6. Verification
SELECT 'Simple set profile system setup completed' as status;
