-- =========================================================
-- META-DATA ON SIGNUP SYSTEM
-- SignUp -> simpan di raw_user_meta_data
-- Login -> extract meta + create profile
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Function untuk create profile dari meta data (saat login)
CREATE OR REPLACE FUNCTION public.create_profile_from_auth_meta()
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    member_code TEXT,
    username TEXT,
    referral_code TEXT,
    profile_created BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_username TEXT;
    v_referral_code TEXT;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            NULL as member_code,
            NULL as username,
            NULL as referral_code,
            FALSE as profile_created;
        RETURN;
    END IF;
    
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_existing_profile;
    
    -- Jika sudah ada, return existing data
    IF v_existing_profile THEN
        SELECT 
            member_code, 
            username, 
            referral_code 
        INTO v_member_code, v_username, v_referral_code
        FROM public.profiles 
        WHERE id = v_user_id;
        
        RETURN QUERY SELECT 
            TRUE as ok,
            'Profile already exists' as message,
            v_member_code as member_code,
            v_username as username,
            v_referral_code as referral_code,
            FALSE as profile_created;
        RETURN;
    END IF;
    
    -- Extract data dari auth.users meta data
    SELECT 
        email,
        raw_user_meta_data->>'username',
        raw_user_meta_data->>'referral_code'
    INTO v_email, v_username, v_referral_code
    FROM auth.users 
    WHERE id = v_user_id;
    
    -- Generate member code
    v_member_code := 'TPC-' || UPPER(substr(md5(v_user_id || random()::text), 1, 6));
    
    -- Buat profile dari meta data
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,
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
        v_username,
        v_referral_code,
        v_member_code,
        'MEMBER',
        'PENDING',
        0,
        FALSE,
        NOW(),
        NOW()
    );
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile created from auth meta data' as message,
        v_member_code as member_code,
        v_username as username,
        v_referral_code as referral_code,
        TRUE as profile_created;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error creating profile: ' || SQLERRM as message,
        NULL as member_code,
        NULL as username,
        NULL as referral_code,
        FALSE as profile_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk process referral dan complete profile
CREATE OR REPLACE FUNCTION public.process_referral_and_complete_profile()
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    referral_processed BOOLEAN,
    referrer_info JSONB,
    profile_status TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_referral_code TEXT;
    v_referrer_id UUID;
    v_referrer_info JSONB;
    v_referral_valid BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            FALSE as referral_processed,
            NULL as referrer_info,
            'ERROR' as profile_status;
        RETURN;
    END IF;
    
    -- Get referral code dari profile
    SELECT referral_code INTO v_referral_code
    FROM public.profiles 
    WHERE id = v_user_id;
    
    -- Process referral jika ada
    v_referral_valid := FALSE;
    v_referrer_id := NULL;
    v_referrer_info := NULL;
    
    IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
        SELECT referrer_id INTO v_referrer_id
        FROM public.validate_referral_code_public(v_referral_code)
        WHERE is_valid = TRUE
        LIMIT 1;
        
        v_referral_valid := (v_referrer_id IS NOT NULL);
        
        IF v_referral_valid THEN
            -- Get referrer info
            SELECT jsonb_build_object(
                'id', id,
                'username', username,
                'member_code', member_code
            ) INTO v_referrer_info
            FROM public.profiles 
            WHERE id = v_referrer_id;
            
            -- Insert referral tracking
            INSERT INTO public.referrals (
                referrer_id,
                referred_id,
                referral_code,
                status
            ) VALUES (
                v_referrer_id,
                v_user_id,
                v_referral_code,
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
            
            -- Update profile dengan referrer
            UPDATE public.profiles
            SET 
                referred_by = v_referrer_id,
                is_profile_complete = TRUE,
                status = 'ACTIVE',
                updated_at = NOW()
            WHERE id = v_user_id;
        ELSE
            -- Update profile tanpa referral
            UPDATE public.profiles
            SET 
                is_profile_complete = TRUE,
                status = 'ACTIVE',
                updated_at = NOW()
            WHERE id = v_user_id;
        END IF;
    ELSE
        -- Update profile tanpa referral
        UPDATE public.profiles
        SET 
            is_profile_complete = TRUE,
            status = 'ACTIVE',
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile processing completed' as message,
        v_referral_valid as referral_processed,
        v_referrer_info as referrer_info,
        CASE WHEN v_referral_valid THEN 'ACTIVE_WITH_REFERRAL' ELSE 'ACTIVE_NO_REFERRAL' END as profile_status;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error processing profile: ' || SQLERRM as message,
        FALSE as referral_processed,
        NULL as referrer_info,
        'ERROR' as profile_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Combined function untuk login flow
CREATE OR REPLACE FUNCTION public.login_flow_complete()
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    step TEXT,
    member_code TEXT,
    username TEXT,
    referral_code TEXT,
    referral_valid BOOLEAN,
    referrer_info JSONB
) AS $$
DECLARE
    v_profile_result RECORD;
    v_referral_result RECORD;
BEGIN
    -- Step 1: Create profile from meta
    SELECT * INTO v_profile_result 
    FROM public.create_profile_from_auth_meta();
    
    IF NOT v_profile_result.ok THEN
        RETURN QUERY SELECT 
            v_profile_result.ok as ok,
            v_profile_result.message as message,
            'profile_creation_failed' as step,
            NULL as member_code,
            NULL as username,
            NULL as referral_code,
            FALSE as referral_valid,
            NULL as referrer_info;
        RETURN;
    END IF;
    
    -- Step 2: Process referral
    SELECT * INTO v_referral_result 
    FROM public.process_referral_and_complete_profile();
    
    RETURN QUERY SELECT 
        v_referral_result.ok as ok,
        v_referral_result.message as message,
        CASE 
            WHEN v_profile_result.profile_created THEN 'login_with_new_profile'
            ELSE 'login_with_existing_profile'
        END as step,
        v_profile_result.member_code as member_code,
        v_profile_result.username as username,
        v_profile_result.referral_code as referral_code,
        v_referral_result.referral_processed as referral_valid,
        v_referral_result.referrer_info as referrer_info;
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Login flow error: ' || SQLERRM as message,
        'flow_error' as step,
        NULL as member_code,
        NULL as username,
        NULL as referral_code,
        FALSE as referral_valid,
        NULL as referrer_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function untuk check profile status
CREATE OR REPLACE FUNCTION public.check_profile_status()
RETURNS TABLE (
    has_profile BOOLEAN,
    is_complete BOOLEAN,
    member_code TEXT,
    username TEXT,
    referral_code TEXT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid()) as has_profile,
        COALESCE(p.is_profile_complete, FALSE) as is_complete,
        p.member_code,
        p.username,
        p.referral_code,
        p.status
    FROM public.profiles p
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT 
        FALSE as has_profile,
        FALSE as is_complete,
        NULL as member_code,
        NULL as username,
        NULL as referral_code,
        'NO_PROFILE' as status
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_from_auth_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_referral_and_complete_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.login_flow_complete() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_profile_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 7. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- 8. Verification
SELECT 'Meta-data on signup system setup completed' as status;
