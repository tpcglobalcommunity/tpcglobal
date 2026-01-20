// =========================================================
// RAW USER META DATA HANDLING
// Extract username, referral_code, dan referred_by dari auth.users
// =========================================================

-- =========================================================
-- UPDATE TRIGGER UNTUK META DATA EXTRACTION
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_member_code TEXT;
    v_username TEXT;
    v_referral_code TEXT;
    v_referred_by TEXT;
    v_referrer_id UUID;
BEGIN
    -- Generate member code unik
    v_member_code := 'TPC-' || UPPER(substr(md5(NEW.id || random()::text), 1, 6));
    
    -- Extract dari raw_user_meta_data
    v_username := NEW.raw_user_meta_data->>'username';
    v_referral_code := NEW.raw_user_meta_data->>'referral_code';
    v_referred_by := NEW.raw_user_meta_data->>'referred_by';
    
    -- Normalisasi data
    v_username := COALESCE(TRIM(LOWER(v_username)), NULL);
    v_referral_code := COALESCE(TRIM(UPPER(v_referral_code)), NULL);
    v_referred_by := COALESCE(TRIM(UPPER(v_referred_by)), NULL);
    
    -- Validasi referral code (jika ada)
    IF v_referral_code IS NOT NULL THEN
        SELECT id INTO v_referrer_id
        FROM public.profiles
        WHERE member_code = v_referral_code
        AND status = 'ACTIVE'
        LIMIT 1;
    END IF;
    
    -- Insert ke profiles dengan data dari meta data
    INSERT INTO public.profiles (
        id,
        email,
        username,
        referral_code,  -- Kode upline dari meta data
        member_code,    -- Kode member baru auto-generated
        referred_by,    -- ID referrer dari validasi
        role,
        status,
        referral_count,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_referral_code,
        v_member_code,
        v_referrer_id,  -- NULL jika referral tidak valid
        'MEMBER',
        CASE 
            WHEN v_username IS NOT NULL THEN 'ACTIVE'
            ELSE 'PENDING'
        END,
        0,
        NOW(),
        NOW()
    );
    
    -- Process referral tracking (jika valid)
    IF v_referrer_id IS NOT NULL THEN
        INSERT INTO public.referrals (
            referrer_id,
            referred_id,
            referral_code,
            status
        ) VALUES (
            v_referrer_id,
            NEW.id,
            v_referral_code,
            'CONFIRMED'
        );
        
        -- Increment referral count
        UPDATE public.profiles
        SET referral_count = referral_count + 1
        WHERE id = v_referrer_id;
    END IF;
    
    RETURN NEW;
EXCEPTION 
    WHEN OTHERS THEN
        -- Log error tapi tidak gagalkan auth
        RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- HELPER FUNCTIONS UNTUK META DATA
-- =========================================================

-- Function untuk extract username dari meta data
CREATE OR REPLACE FUNCTION public.extract_username_from_meta(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_username TEXT;
BEGIN
    SELECT raw_user_meta_data->>'username'
    INTO v_username
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(TRIM(LOWER(v_username)), NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk extract referral code dari meta data
CREATE OR REPLACE FUNCTION public.extract_referral_code_from_meta(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_referral_code TEXT;
BEGIN
    SELECT raw_user_meta_data->>'referral_code'
    INTO v_referral_code
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(TRIM(UPPER(v_referral_code)), NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function untuk extract referred_by dari meta data
CREATE OR REPLACE FUNCTION public.extract_referred_by_from_meta(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_referred_by TEXT;
BEGIN
    SELECT raw_user_meta_data->>'referred_by'
    INTO v_referred_by
    FROM auth.users
    WHERE id = p_user_id;
    
    RETURN COALESCE(TRIM(UPPER(v_referred_by)), NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- PROFILE CREATION DARI META DATA
-- =========================================================

-- Function untuk create/update profile dari meta data
CREATE OR REPLACE FUNCTION public.create_profile_from_meta(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    profile_id UUID,
    username TEXT,
    member_code TEXT,
    referral_code TEXT,
    status TEXT
) AS $$
DECLARE
    v_user_record RECORD;
    v_member_code TEXT;
    v_username TEXT;
    v_referral_code TEXT;
    v_referred_by TEXT;
    v_referrer_id UUID;
    v_profile_exists BOOLEAN;
BEGIN
    -- Get user data dari auth.users
    SELECT * INTO v_user_record
    FROM auth.users
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'User not found', NULL::UUID, NULL, NULL, NULL, NULL;
        RETURN;
    END IF;
    
    -- Check apakah profile sudah ada
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = p_user_id) INTO v_profile_exists;
    
    -- Extract dari meta data
    v_username := v_user_record.raw_user_meta_data->>'username';
    v_referral_code := v_user_record.raw_user_meta_data->>'referral_code';
    v_referred_by := v_user_record.raw_user_meta_data->>'referred_by';
    
    -- Normalisasi
    v_username := COALESCE(TRIM(LOWER(v_username)), NULL);
    v_referral_code := COALESCE(TRIM(UPPER(v_referral_code)), NULL);
    v_referred_by := COALESCE(TRIM(UPPER(v_referred_by)), NULL);
    
    -- Generate member code jika belum ada
    IF NOT v_profile_exists THEN
        v_member_code := 'TPC-' || UPPER(substr(md5(p_user_id || random()::text), 1, 6));
    ELSE
        SELECT member_code INTO v_member_code
        FROM public.profiles
        WHERE id = p_user_id;
    END IF;
    
    -- Validasi referral
    IF v_referral_code IS NOT NULL THEN
        SELECT id INTO v_referrer_id
        FROM public.profiles
        WHERE member_code = v_referral_code
        AND status = 'ACTIVE'
        LIMIT 1;
    END IF;
    
    -- Insert atau update profile
    IF v_profile_exists THEN
        UPDATE public.profiles SET
            username = COALESCE(v_username, username),
            referral_code = COALESCE(v_referral_code, referral_code),
            referred_by = COALESCE(v_referrer_id, referred_by),
            status = CASE 
                WHEN v_username IS NOT NULL THEN 'ACTIVE'
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = p_user_id;
    ELSE
        INSERT INTO public.profiles (
            id, email, username, referral_code, member_code, 
            referred_by, role, status, referral_count, created_at, updated_at
        ) VALUES (
            p_user_id, v_user_record.email, v_username, v_referral_code, v_member_code,
            v_referrer_id, 'MEMBER', 
            CASE WHEN v_username IS NOT NULL THEN 'ACTIVE' ELSE 'PENDING' END,
            0, NOW(), NOW()
        );
    END IF;
    
    -- Process referral tracking
    IF v_referrer_id IS NOT NULL AND NOT v_profile_exists THEN
        INSERT INTO public.referrals (
            referrer_id, referred_id, referral_code, status
        ) VALUES (
            v_referrer_id, p_user_id, v_referral_code, 'CONFIRMED'
        );
        
        UPDATE public.profiles
        SET referral_count = referral_count + 1
        WHERE id = v_referrer_id;
    END IF;
    
    -- Return result
    RETURN QUERY SELECT 
        true, 
        'Profile created/updated successfully',
        p_user_id,
        v_username,
        v_member_code,
        v_referral_code,
        CASE WHEN v_username IS NOT NULL THEN 'ACTIVE' ELSE 'PENDING' END;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- FINALIZE PROFILE DARI META DATA
-- =========================================================

-- Function untuk finalize profile menggunakan meta data
CREATE OR REPLACE FUNCTION public.finalize_profile_from_meta(
    p_username TEXT DEFAULT NULL,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    ok BOOLEAN,
    message TEXT,
    navigation_route TEXT,
    profile_status TEXT
) AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_meta JSONB;
    v_updated_meta JSONB;
    v_result RECORD;
BEGIN
    -- Check authentication
    IF v_user_id IS NULL THEN
        RETURN QUERY SELECT false, 'Not authenticated', '/signin', NULL;
        RETURN;
    END IF;
    
    -- Get current meta data
    SELECT raw_user_meta_data INTO v_current_meta
    FROM auth.users
    WHERE id = v_user_id;
    
    -- Update meta data dengan parameter
    v_updated_meta := COALESCE(v_current_meta, '{}'::JSONB);
    
    IF p_username IS NOT NULL THEN
        v_updated_meta := jsonb_set(v_updated_meta, '{username}', to_jsonb(p_username));
    END IF;
    
    IF p_referral_code IS NOT NULL THEN
        v_updated_meta := jsonb_set(v_updated_meta, '{referral_code}', to_jsonb(p_referral_code));
    END IF;
    
    -- Update auth.users meta data
    UPDATE auth.users
    SET raw_user_meta_data = v_updated_meta
    WHERE id = v_user_id;
    
    -- Create/update profile dari meta data
    SELECT * INTO v_result
    FROM create_profile_from_meta(v_user_id);
    
    IF v_result.success THEN
        RETURN QUERY SELECT 
            true, 
            'Profile finalized successfully',
            CASE 
                WHEN v_result.status = 'ACTIVE' THEN '/member/dashboard'
                ELSE '/member/onboarding'
            END,
            v_result.status;
    ELSE
        RETURN QUERY SELECT false, v_result.message, '/member/onboarding', NULL;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- GRANTS
-- =========================================================

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.extract_username_from_meta(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extract_referral_code_from_meta(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.extract_referred_by_from_meta(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_from_meta(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_profile_from_meta(TEXT, TEXT) TO authenticated;

-- =========================================================
-- TRIGGER
-- =========================================================

-- Drop dan recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
