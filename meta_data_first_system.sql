-- =========================================================
-- META-DATA FIRST SYSTEM
-- 1. SignUp -> simpan username & referral_code di meta
-- 2. Login -> create profile dari meta data
-- 3. Update -> proses referral tracking
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Function untuk create profile dari meta data (saat login)
CREATE OR REPLACE FUNCTION public.create_profile_from_meta()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    member_code TEXT,
    username TEXT,
    referral_code TEXT
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
            FALSE as success,
            'User not authenticated' as message,
            NULL as member_code,
            NULL as username,
            NULL as referral_code;
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
            TRUE as success,
            'Profile already exists' as message,
            v_member_code as member_code,
            v_username as username,
            v_referral_code as referral_code;
        RETURN;
    END IF;
    
    -- Get data dari auth.users (meta data)
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
        TRUE as success,
        'Profile created from meta data' as message,
        v_member_code as member_code,
        v_username as username,
        v_referral_code as referral_code;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as success,
        'Error creating profile: ' || SQLERRM as message,
        NULL as member_code,
        NULL as username,
        NULL as referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk proses referral dan complete profile
CREATE OR REPLACE FUNCTION public.complete_profile_with_referral()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    referral_processed BOOLEAN,
    referrer_info JSONB
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
            FALSE as success,
            'User not authenticated' as message,
            FALSE as referral_processed,
            NULL as referrer_info;
        RETURN;
    END IF;
    
    -- Get referral code dari profile
    SELECT referral_code INTO v_referral_code
    FROM public.profiles 
    WHERE id = v_user_id;
    
    -- Proses referral jika ada
    v_referral_valid := FALSE;
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
            
            -- Process referral tracking
            PERFORM public.process_referral_after_signup(v_user_id, v_referral_code);
            
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
        TRUE as success,
        'Profile completed successfully' as message,
        v_referral_valid as referral_processed,
        v_referrer_info as referrer_info;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as success,
        'Error completing profile: ' || SQLERRM as message,
        FALSE as referral_processed,
        NULL as referrer_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk get profile status
CREATE OR REPLACE FUNCTION public.get_profile_status()
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
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_from_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_profile_with_referral() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 6. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

-- 7. Verification
SELECT 'Meta-data first system setup completed' as status;
