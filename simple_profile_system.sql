-- =========================================================
-- SIMPLE PROFILE CREATION AFTER LOGIN
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Simple function untuk create profile after login
CREATE OR REPLACE FUNCTION public.create_profile_after_login()
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    member_code TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
BEGIN
    -- Get current user ID dan email
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'User not authenticated' as message,
            NULL as member_code;
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
    
    -- Jika sudah ada, return existing data
    IF v_existing_profile THEN
        SELECT member_code INTO v_member_code
        FROM public.profiles 
        WHERE id = v_user_id;
        
        RETURN QUERY SELECT 
            TRUE as success,
            'Profile already exists' as message,
            v_member_code as member_code;
        RETURN;
    END IF;
    
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
    
    RETURN QUERY SELECT 
        TRUE as success,
        'Profile created successfully' as message,
        v_member_code as member_code;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as success,
        'Error creating profile: ' || SQLERRM as message,
        NULL as member_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk update profile dengan referral
CREATE OR REPLACE FUNCTION public.update_profile_with_referral(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    referral_valid BOOLEAN,
    referrer_username TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_referrer_id UUID;
    v_referrer_username TEXT;
    v_referral_valid BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as success,
            'User not authenticated' as message,
            FALSE as referral_valid,
            NULL as referrer_username;
        RETURN;
    END IF;
    
    -- Validate referral code jika ada
    v_referral_valid := FALSE;
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT referrer_id, referrer_username INTO v_referrer_id, v_referrer_username
        FROM public.validate_referral_code_public(p_referral_code)
        WHERE is_valid = TRUE
        LIMIT 1;
        
        v_referral_valid := (v_referrer_id IS NOT NULL);
        
        -- Process referral jika valid
        IF v_referral_valid THEN
            PERFORM public.process_referral_after_signup(v_user_id, p_referral_code);
        END IF;
    END IF;
    
    -- Update profile
    UPDATE public.profiles
    SET 
        username = p_username,
        referral_code = p_referral_code,
        referred_by = v_referrer_id,
        is_profile_complete = TRUE,
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN QUERY SELECT 
        TRUE as success,
        'Profile updated successfully' as message,
        v_referral_valid as referral_valid,
        v_referrer_username as referrer_username;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as success,
        'Error updating profile: ' || SQLERRM as message,
        FALSE as referral_valid,
        NULL as referrer_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_after_login() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_with_referral(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 5. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

-- 6. Test queries
SELECT 'Simple profile system setup completed' as status;
