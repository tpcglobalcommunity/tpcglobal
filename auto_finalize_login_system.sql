-- =========================================================
-- AUTO FINALIZE ON LOGIN SYSTEM
-- finalize_profile_and_referral() + helper functions
-- =========================================================

-- 1. Function untuk auto-finalize saat login (dengan meta check)
CREATE OR REPLACE FUNCTION public.auto_finalize_if_meta_available(
    p_check_meta_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    needs_finalize BOOLEAN,
    has_meta BOOLEAN,
    member_code TEXT,
    action_taken TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_has_profile BOOLEAN;
    v_is_complete BOOLEAN;
    v_needs_finalize BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            FALSE as needs_finalize,
            FALSE as has_meta,
            NULL as member_code,
            NULL as action_taken;
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
    
    v_needs_finalize := (v_has_profile = FALSE OR v_is_complete = FALSE);
    
    -- Jika hanya check meta
    IF p_check_meta_only THEN
        RETURN QUERY SELECT 
            TRUE as ok,
            'Meta check completed' as message,
            v_needs_finalize as needs_finalize,
            TRUE as has_meta, -- Frontend akan cek localStorage
            NULL as member_code,
            NULL as action_taken;
        RETURN;
    END IF;
    
    -- Jika tidak perlu finalize
    IF NOT v_needs_finalize THEN
        RETURN QUERY SELECT 
            TRUE as ok,
            'Profile already complete' as message,
            FALSE as needs_finalize,
            TRUE as has_meta,
            (SELECT member_code FROM public.profiles WHERE id = v_user_id) as member_code,
            'none_needed' as action_taken;
        RETURN;
    END IF;
    
    -- Jika perlu finalize tapi tidak ada meta (frontend harus provide)
    RETURN QUERY SELECT 
        FALSE as ok,
            'Profile needs finalize but no meta provided' as message,
        TRUE as needs_finalize,
        FALSE as has_meta,
        NULL as member_code,
        'requires_meta' as action_taken;
    RETURN;
    
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error checking profile: ' || SQLERRM as message,
        FALSE as needs_finalize,
        FALSE as has_meta,
        NULL as member_code,
        NULL as action_taken;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enhanced finalize function dengan auto-cleanup
CREATE OR REPLACE FUNCTION public.finalize_profile_and_referral(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL,
    p_auto_cleanup BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    member_code TEXT,
    referral_valid BOOLEAN,
    referrer_info JSONB,
    profile_created BOOLEAN,
    action_taken TEXT
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
    v_action_taken TEXT;
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
            FALSE as profile_created,
            'error' as action_taken;
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
        v_action_taken := 'updated';
        
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
        v_action_taken := 'created';
        
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
        v_profile_created as profile_created,
        v_action_taken as action_taken;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error finalizing profile: ' || SQLERRM as message,
        NULL as member_code,
        FALSE as referral_valid,
        NULL as referrer_info,
        FALSE as profile_created,
        'error' as action_taken;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk get dashboard data (setelah finalize)
CREATE OR REPLACE FUNCTION public.get_member_dashboard()
RETURNS TABLE (
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referral_count INTEGER,
    status TEXT,
    created_at TIMESTAMPTZ,
    is_complete BOOLEAN,
    has_referrer BOOLEAN,
    referrer_info JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.username,
        p.member_code,
        p.referral_code,
        p.referral_count,
        p.status,
        p.created_at,
        p.is_profile_complete,
        (p.referred_by IS NOT NULL) as has_referrer,
        CASE 
            WHEN p.referred_by IS NOT NULL THEN
                jsonb_build_object(
                    'id', p.referred_by,
                    'username', pr.username,
                    'member_code', pr.member_code
                )
            ELSE NULL
        END as referrer_info
    FROM public.profiles p
    LEFT JOIN public.profiles pr ON p.referred_by = pr.id
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.auto_finalize_if_meta_available(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_profile_and_referral(TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 5. Verification
SELECT 'Auto finalize login system setup completed' as status;
