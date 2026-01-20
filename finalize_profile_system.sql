-- =========================================================
-- FINALIZE PROFILE SYSTEM
-- finalize_profile_and_referral() - setelah signup/login
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Function untuk finalize profile setelah signup
CREATE OR REPLACE FUNCTION public.finalize_profile_and_referral(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    member_code TEXT,
    referral_valid BOOLEAN,
    referrer_info JSONB,
    profile_created BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
    v_referrer_id UUID;
    v_referrer_info JSONB;
    v_referral_valid BOOLEAN;
    v_profile_created BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            NULL as member_code,
            FALSE as referral_valid,
            NULL as referrer_info,
            FALSE as profile_created;
        RETURN;
    END IF;
    
    -- Get email dari auth.users
    SELECT email INTO v_email
    FROM auth.users 
    WHERE id = v_user_id;
    
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_existing_profile;
    
    -- Validate referral code
    v_referral_valid := FALSE;
    v_referrer_id := NULL;
    v_referrer_info := NULL;
    
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT 
            referrer_id, 
            referrer_username,
            referrer_member_code,
            is_valid
        INTO v_referrer_id, v_referrer_info->>'username', v_referrer_info->>'member_code', v_referral_valid
        FROM public.validate_referral_code_public(p_referral_code)
        WHERE is_valid = TRUE
        LIMIT 1;
        
        -- Build referrer info
        IF v_referral_valid AND v_referrer_id IS NOT NULL THEN
            v_referrer_info := jsonb_build_object(
                'id', v_referrer_id,
                'username', v_referrer_info->>'username',
                'member_code', v_referrer_info->>'member_code'
            );
        END IF;
    END IF;
    
    -- Create atau update profile
    IF v_existing_profile THEN
        -- UPDATE existing profile
        v_profile_created := FALSE;
        
        -- Get existing member_code
        SELECT member_code INTO v_member_code
        FROM public.profiles 
        WHERE id = v_user_id;
        
        -- Process referral jika valid dan belum ada
        IF v_referral_valid AND v_referrer_id IS NOT NULL THEN
            -- Insert referral tracking (hanya jika belum ada)
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
            
            -- Increment referrer count (hanya jika referral baru)
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
        v_profile_created := TRUE;
        
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
        CASE 
            WHEN v_profile_created THEN 'Profile created and finalized successfully'
            ELSE 'Profile finalized successfully'
        END as message,
        v_member_code as member_code,
        v_referral_valid as referral_valid,
        v_referrer_info as referrer_info,
        v_profile_created as profile_created;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error finalizing profile: ' || SQLERRM as message,
        NULL as member_code,
        FALSE as referral_valid,
        NULL as referrer_info,
        FALSE as profile_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk check apakah perlu finalize
CREATE OR REPLACE FUNCTION public.needs_profile_finalization()
RETURNS TABLE (
    needs_finalize BOOLEAN,
    has_profile BOOLEAN,
    is_complete BOOLEAN,
    stored_meta_available BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_has_profile BOOLEAN;
    v_is_complete BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as needs_finalize,
            FALSE as has_profile,
            FALSE as is_complete,
            FALSE as stored_meta_available;
        RETURN;
    END IF;
    
    -- Check profile status
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_has_profile;
    
    SELECT COALESCE(is_profile_complete, FALSE) INTO v_is_complete
    FROM public.profiles 
    WHERE id = v_user_id;
    
    RETURN QUERY SELECT 
        (v_has_profile = FALSE OR v_is_complete = FALSE) as needs_finalize,
        v_has_profile as has_profile,
        v_is_complete as is_complete,
        TRUE as stored_meta_available; -- Frontend akan cek localStorage
        
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk get member info (setelah finalize)
CREATE OR REPLACE FUNCTION public.get_member_info()
RETURNS TABLE (
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
        p.username,
        p.member_code,
        p.referral_code,
        p.referral_count,
        p.status,
        p.created_at
    FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.is_profile_complete = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.finalize_profile_and_referral(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.needs_profile_finalization() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_info() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 6. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- 7. Verification
SELECT 'Finalize profile system setup completed' as status;
