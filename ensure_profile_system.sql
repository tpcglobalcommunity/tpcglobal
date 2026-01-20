-- =========================================================
-- ENSURE PROFILE SYSTEM
-- ensure_profile() - create if not exists, return complete data
-- =========================================================

-- 1. Pastikan kolom yang dibutuhkan ada
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS member_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- 2. Function untuk ensure profile (create if not exists)
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referred_by UUID,
    referral_count INTEGER,
    role TEXT,
    status TEXT,
    is_profile_complete BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    profile_created BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_user_id UUID;
    v_email TEXT;
    v_member_code TEXT;
    v_existing_profile BOOLEAN;
    v_profile_created BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            NULL::UUID as id,
            NULL::TEXT as email,
            NULL::TEXT as username,
            NULL::TEXT as member_code,
            NULL::TEXT as referral_code,
            NULL::UUID as referred_by,
            0 as referral_count,
            NULL::TEXT as role,
            'ERROR' as status,
            FALSE as is_profile_complete,
            NULL::TIMESTAMPTZ as created_at,
            NULL::TIMESTAMPTZ as updated_at,
            FALSE as profile_created,
            'User not authenticated' as message;
        RETURN;
    END IF;
    
    -- Cek apakah profile sudah ada
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE id = v_user_id
    ) INTO v_existing_profile;
    
    -- Jika sudah ada, return existing data
    IF v_existing_profile THEN
        v_profile_created := FALSE;
        
        RETURN QUERY SELECT 
            p.id,
            p.email,
            p.username,
            p.member_code,
            p.referral_code,
            p.referred_by,
            p.referral_count,
            p.role,
            p.status,
            p.is_profile_complete,
            p.created_at,
            p.updated_at,
            v_profile_created as profile_created,
            'Profile already exists' as message
        FROM public.profiles p
        WHERE p.id = v_user_id;
        RETURN;
    END IF;
    
    -- Get email dari auth.users
    SELECT email INTO v_email
    FROM auth.users 
    WHERE id = v_user_id;
    
    -- Generate member code
    v_member_code := 'TPC-' || UPPER(substr(md5(v_user_id || random()::text), 1, 6));
    
    -- Buat profile baru
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
    
    v_profile_created := TRUE;
    
    -- Return new profile data
    RETURN QUERY SELECT 
        p.id,
        p.email,
        p.username,
        p.member_code,
        p.referral_code,
        p.referred_by,
        p.referral_count,
        p.role,
        p.status,
        p.is_profile_complete,
        p.created_at,
        p.updated_at,
        v_profile_created as profile_created,
        'Profile created successfully' as message
    FROM public.profiles p
    WHERE p.id = v_user_id;
    
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        NULL::UUID as id,
        NULL::TEXT as email,
        NULL::TEXT as username,
        NULL::TEXT as member_code,
        NULL::TEXT as referral_code,
        NULL::UUID as referred_by,
        0 as referral_count,
        NULL::TEXT as role,
        'ERROR' as status,
        FALSE as is_profile_complete,
        NULL::TIMESTAMPTZ as created_at,
        NULL::TIMESTAMPTZ as updated_at,
        FALSE as profile_created,
        'Error: ' || SQLERRM as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk get current profile (no create)
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    referred_by UUID,
    referral_count INTEGER,
    role TEXT,
    status TEXT,
    is_profile_complete BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    has_profile BOOLEAN
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
        p.role,
        p.status,
        p.is_profile_complete,
        p.created_at,
        p.updated_at,
        TRUE as has_profile
    FROM public.profiles p
    WHERE p.id = auth.uid()
    UNION ALL
    SELECT 
        NULL::UUID as id,
        NULL::TEXT as email,
        NULL::TEXT as username,
        NULL::TEXT as member_code,
        NULL::TEXT as referral_code,
        NULL::UUID as referred_by,
        0 as referral_count,
        NULL::TEXT as role,
        'NO_PROFILE' as status,
        FALSE as is_profile_complete,
        NULL::TIMESTAMPTZ as created_at,
        NULL::TIMESTAMPTZ as updated_at,
        FALSE as has_profile
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk update profile (set username & referral)
CREATE OR REPLACE FUNCTION public.update_profile(
    p_username TEXT DEFAULT NULL,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    profile_updated BOOLEAN
) AS $$
DECLARE
    v_user_id UUID;
    v_referrer_id UUID;
    v_referral_valid BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT 
            FALSE as ok,
            'User not authenticated' as message,
            FALSE as profile_updated;
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
    
    -- Update profile
    UPDATE public.profiles
    SET 
        username = COALESCE(p_username, username),
        referral_code = COALESCE(p_referral_code, referral_code),
        referred_by = COALESCE(v_referrer_id, referred_by),
        is_profile_complete = TRUE,
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN QUERY SELECT 
        TRUE as ok,
        'Profile updated successfully' as message,
        TRUE as profile_updated;
        
    RETURN;
EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
        FALSE as ok,
        'Error updating profile: ' || SQLERRM as message,
        FALSE as profile_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.ensure_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile(TEXT, TEXT) TO authenticated;
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
SELECT 'Ensure profile system setup completed' as status;
