-- =========================================================
-- UNIFIED PROFILE SYSTEM
-- create_or_update_profile() - all-in-one function
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Unified function untuk create OR update profile
CREATE OR REPLACE FUNCTION public.create_or_update_profile(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    action TEXT, -- 'created' | 'updated'
    member_code TEXT,
    referral_valid BOOLEAN,
    referrer_username TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
    v_referrer_id UUID;
    v_referrer_username TEXT;
    v_referral_valid BOOLEAN;
    v_action TEXT;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            NULL as action,
            NULL as member_code,
            FALSE as referral_valid,
            NULL as referrer_username;
        RETURN;
    END IF;
    
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_existing_profile;
    
    -- Get email dari auth.users
    SELECT email INTO v_email
    FROM auth.users 
    WHERE id = v_user_id;
    
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
    END IF;
    
    -- CREATE atau UPDATE
    IF v_existing_profile THEN
        -- UPDATE existing profile
        v_action := 'updated';
        
        -- Get existing member_code
        SELECT member_code INTO v_member_code
        FROM public.profiles 
        WHERE id = v_user_id;
        
        -- Process referral jika valid dan belum ada referral
        IF v_referral_valid AND v_referrer_id IS NOT NULL THEN
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
        
        -- Update profile
        UPDATE public.profiles
        SET 
            username = p_username,
            referral_code = p_referral_code,
            referred_by = COALESCE(v_referrer_id, referred_by),
            is_profile_complete = TRUE,
            status = 'ACTIVE',
            updated_at = NOW()
        WHERE id = v_user_id;
        
    ELSE
        -- CREATE new profile
        v_action := 'created';
        
        -- Generate member code
        v_member_code := 'TPC-' || UPPER(substr(md5(v_user_id || random()::text), 1, 6));
        
        -- Process referral jika valid
        IF v_referral_valid AND v_referrer_id IS NOT NULL THEN
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
            );
            
            -- Increment referrer count
            UPDATE public.profiles
            SET referral_count = referral_count + 1
            WHERE id = v_referrer_id;
        END IF;
        
        -- Create new profile
        INSERT INTO public.profiles (
            id,
            email,
            username,
            referral_code,
            member_code,
            referred_by,
            role,
            status,
            referral_count,
            is_profile_complete,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_email,
            p_username,
            p_referral_code,
            v_member_code,
            v_referrer_id,
            'MEMBER',
            'ACTIVE',
            0,
            TRUE,
            NOW(),
            NOW()
        );
    END IF;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile ' || v_action || ' successfully' as message,
        v_action as action,
        v_member_code as member_code,
        v_referral_valid as referral_valid,
        v_referrer_username as referrer_username;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error: ' || SQLERRM as message,
        NULL as action,
        NULL as member_code,
        FALSE as referral_valid,
        NULL as referrer_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk get profile status
CREATE OR REPLACE FUNCTION public.get_profile_status()
RETURNS TABLE (
    has_profile BOOLEAN,
    is_complete BOOLEAN,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referral_count INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as has_profile,
        COALESCE(p.is_profile_complete, FALSE) as is_complete,
        p.username,
        p.member_code,
        p.referral_code,
        p.referral_count,
        p.status,
        p.created_at
    FROM public.profiles p
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT 
        FALSE as has_profile,
        FALSE as is_complete,
        NULL as username,
        NULL as member_code,
        NULL as referral_code,
        0 as referral_count,
        'NO_PROFILE' as status,
        NULL as created_at
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_or_update_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_status() TO authenticated;
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
SELECT 'Unified profile system setup completed' as status;
