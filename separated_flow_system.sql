-- =========================================================
-- SEPARATED FLOW SYSTEM
-- 1. Signup -> auth.users ONLY
-- 2. Login -> create profile  
-- 3. Update -> referral, username, role, dll
-- =========================================================

-- 1. Drop existing trigger (kita tidak auto-create profile)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Profiles table dengan kolom lengkap
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 3. Function untuk membuat profile saat login
CREATE OR REPLACE FUNCTION public.create_profile_on_login(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
BEGIN
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id
    ) INTO v_existing_profile;
    
    -- Jika sudah ada, return true
    IF v_existing_profile THEN
        RETURN TRUE;
    END IF;
    
    -- Generate member code
    v_member_code := 'TPC-' || UPPER(substr(md5(p_user_id || random()::text), 1, 6));
    
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
    )
    SELECT 
        id,
        email,
        v_member_code,
        'MEMBER',
        'PENDING',
        0,
        FALSE,
        NOW(),
        NOW()
    FROM auth.users 
    WHERE id = p_user_id;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for user %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk update profile lengkap (referral, username, dll)
CREATE OR REPLACE FUNCTION public.update_complete_profile(
    p_user_id UUID,
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    member_code TEXT,
    referrer_info JSONB
) AS $$
DECLARE
    v_member_code TEXT;
    v_referrer_id UUID;
    v_referrer_info JSONB;
    v_referral_valid BOOLEAN;
BEGIN
    -- Get current member_code
    SELECT member_code INTO v_member_code
    FROM public.profiles 
    WHERE id = p_user_id;
    
    -- Validate referral code jika ada
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT referrer_id, is_valid INTO v_referrer_id, v_referral_valid
        FROM public.validate_referral_code_public(p_referral_code)
        WHERE is_valid = TRUE
        LIMIT 1;
        
        IF v_referral_valid THEN
            -- Get referrer info
            SELECT jsonb_build_object(
                'id', id,
                'username', username,
                'member_code', member_code
            ) INTO v_referrer_info
            FROM public.profiles 
            WHERE id = v_referrer_id;
            
            -- Process referral
            PERFORM public.process_referral_after_signup(p_user_id, p_referral_code);
        END IF;
    END IF;
    
    -- Update profile dengan data lengkap
    UPDATE public.profiles
    SET 
        username = p_username,
        referral_code = p_referral_code,
        referred_by = v_referrer_id,
        is_profile_complete = TRUE,
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN QUERY SELECT 
        TRUE as success,
        'Profile updated successfully' as message,
        v_member_code as member_code,
        v_referrer_info as referrer_info;
        
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC untuk user management
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referred_by UUID,
    referral_count INTEGER,
    is_profile_complete BOOLEAN,
    status TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.username,
        p.member_code,
        p.referral_code,
        p.referred_by,
        p.referral_count,
        p.is_profile_complete,
        p.status,
        p.role
    FROM public.profiles p
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_on_login(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_complete_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 7. RLS policies untuk profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view own profile
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Service role can insert (via RPC)
CREATE POLICY "Service insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 8. Verification queries
SELECT 'Separated flow system setup completed' as status;

-- Check functions
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname IN ('create_profile_on_login', 'update_complete_profile', 'get_user_profile')
ORDER BY proname;
