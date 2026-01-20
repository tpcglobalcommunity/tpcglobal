-- =========================================================
-- PROFILE STATUS & ROLE MANAGEMENT SYSTEM
-- Role-based navigation dan status management
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- 2. Function untuk update login activity
CREATE OR REPLACE FUNCTION public.update_login_activity()
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    login_count INTEGER,
    last_login TIMESTAMPTZ
) AS $$
DECLARE
    v_user_id UUID;
    v_login_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            0 as login_count,
            NULL as last_login;
        RETURN;
    END IF;
    
    -- Update login activity
    UPDATE public.profiles
    SET 
        last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE id = v_user_id
    RETURNING login_count, last_login INTO v_login_count, last_login;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Login activity updated' as message,
        v_login_count as login_count,
        v_last_login as last_login;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error updating login activity: ' || SQLERRM as message,
        0 as login_count,
        NULL as last_login;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk get navigation route based on profile
CREATE OR REPLACE FUNCTION public.get_navigation_route()
RETURNS TABLE (
    route TEXT,
    reason TEXT,
    profile_status TEXT,
    user_role TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            '/auth/login' as route,
            'User not authenticated' as reason,
            'NO_AUTH' as profile_status,
            'ANONYMOUS' as user_role;
        RETURN;
    END IF;
    
    -- Get profile data
    SELECT * INTO v_profile
    FROM public.profiles 
    WHERE id = v_user_id;
    
    -- Jika tidak ada profile
    IF v_profile IS NULL THEN
        RETURN QUERY SELECT 
            '/member/onboarding' as route,
            'No profile found' as reason,
            'NO_PROFILE' as profile_status,
            'MEMBER' as user_role;
        RETURN;
    END IF;
    
    -- Logic untuk navigation
    IF v_profile.role = 'super_admin' THEN
        RETURN QUERY SELECT 
            '/admin' as route,
            'Super admin access' as reason,
            v_profile.status as profile_status,
            v_profile.role as user_role;
        RETURN;
    ELSIF v_profile.role = 'admin' THEN
        RETURN QUERY SELECT 
            '/admin' as route,
            'Admin access' as reason,
            v_profile.status as profile_status,
            v_profile.role as user_role;
        RETURN;
    ELSIF v_profile.status != 'ACTIVE' THEN
        RETURN QUERY SELECT 
            '/member/onboarding' as route,
            'Profile not active' as reason,
            v_profile.status as profile_status,
            v_profile.role as user_role;
        RETURN;
    ELSIF NOT v_profile.is_profile_complete THEN
        RETURN QUERY SELECT 
            '/member/onboarding' as route,
            'Profile incomplete' as reason,
            v_profile.status as profile_status,
            v_profile.role as user_role;
        RETURN;
    ELSE
        RETURN QUERY SELECT 
            '/member/dashboard' as route,
            'Active member' as reason,
            v_profile.status as profile_status,
            v_profile.role as user_role;
        RETURN;
    END IF;
    
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        '/member/onboarding' as route,
        'Error determining route: ' || SQLERRM as reason,
        'ERROR' as profile_status,
        'MEMBER' as user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk activate profile (complete onboarding)
CREATE OR REPLACE FUNCTION public.activate_profile(
    p_username TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    navigation_route TEXT,
    profile_status TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_referrer_id UUID;
    v_referral_valid BOOLEAN;
    v_navigation_route TEXT;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            '/auth/login' as navigation_route,
            'NO_AUTH' as profile_status;
        RETURN;
    END IF;
    
    -- Validate referral code jika ada
    v_referral_valid := FALSE;
    v_referrer_id := NULL;
    
    IF p_referral_code IS NOT NULL AND p_referral_code != '' THEN
        SELECT referrer_id INTO v_referrer_id
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
    
    -- Activate profile
    UPDATE public.profiles
    SET 
        username = p_username,
        referral_code = p_referral_code,
        referred_by = v_referrer_id,
        is_profile_complete = TRUE,
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Determine navigation route
    IF v_referral_valid THEN
        v_navigation_route := '/member/dashboard';
    ELSE
        v_navigation_route := '/member/dashboard';
    END IF;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile activated successfully' as message,
        v_navigation_route as navigation_route,
        'ACTIVE' as profile_status;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error activating profile: ' || SQLERRM as message,
        '/member/onboarding' as navigation_route,
        'ERROR' as profile_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function untuk change user role (admin only)
CREATE OR REPLACE FUNCTION public.change_user_role(
    p_target_user_id UUID,
    p_new_role TEXT
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    old_role TEXT,
    new_role TEXT
) AS $$
DECLARE
    v_current_user_id UUID;
    v_current_role TEXT;
    v_old_role TEXT;
    v_is_admin BOOLEAN;
BEGIN
    v_current_user_id := auth.uid();
    
    -- Check if current user is admin
    SELECT role INTO v_current_role
    FROM public.profiles 
    WHERE id = v_current_user_id;
    
    v_is_admin := (v_current_role IN ('super_admin', 'admin'));
    
    IF NOT v_is_admin THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'Insufficient permissions' as message,
            NULL as old_role,
            NULL as new_role;
        RETURN;
    END IF;
    
    -- Get old role
    SELECT role INTO v_old_role
    FROM public.profiles 
    WHERE id = p_target_user_id;
    
    -- Update role
    UPDATE public.profiles
    SET 
        role = p_new_role,
        updated_at = NOW()
    WHERE id = p_target_user_id;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Role updated successfully' as message,
        v_old_role as old_role,
        p_new_role as new_role;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error changing role: ' || SQLERRM as message,
        NULL as old_role,
        NULL as new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function untuk get profile with navigation info
CREATE OR REPLACE FUNCTION public.get_profile_with_navigation()
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    member_code TEXT,
    role TEXT,
    status TEXT,
    is_profile_complete BOOLEAN,
    navigation_route TEXT,
    navigation_reason TEXT,
    can_access_admin BOOLEAN,
    can_access_member BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
    v_navigation RECORD;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID as id,
            NULL::TEXT as email,
            NULL::TEXT as username,
            NULL::TEXT as member_code,
            'ANONYMOUS' as role,
            'NO_AUTH' as status,
            FALSE as is_profile_complete,
            '/auth/login' as navigation_route,
            'Not authenticated' as navigation_reason,
            FALSE as can_access_admin,
            FALSE as can_access_member;
        RETURN;
    END IF;
    
    -- Get profile
    SELECT * INTO v_profile
    FROM public.profiles 
    WHERE id = v_user_id;
    
    -- Get navigation
    SELECT * INTO v_navigation
    FROM public.get_navigation_route();
    
    -- Return combined data
    RETURN QUERY SELECT 
        v_profile.id,
        v_profile.email,
        v_profile.username,
        v_profile.member_code,
        v_profile.role,
        v_profile.status,
        v_profile.is_profile_complete,
        v_navigation.route as navigation_route,
        v_navigation.reason as navigation_reason,
        (v_profile.role IN ('super_admin', 'admin')) as can_access_admin,
        (v_profile.status = 'ACTIVE' AND v_profile.is_profile_complete) as can_access_member;
    
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        NULL::UUID as id,
        NULL::TEXT as email,
        NULL::TEXT as username,
        NULL::TEXT as member_code,
        'ERROR' as role,
        'ERROR' as status,
        FALSE as is_profile_complete,
        '/member/onboarding' as navigation_route,
        'Error loading profile' as navigation_reason,
        FALSE as can_access_admin,
        FALSE as can_access_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_login_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_navigation_route() TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_with_navigation() TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(TEXT) TO authenticated;

-- 8. RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Users view own referrals" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- 9. Verification
SELECT 'Profile status & role management system setup completed' as status;
