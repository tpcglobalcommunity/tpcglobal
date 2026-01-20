-- REBUILD RPC: DROP + CREATE get_my_referral_analytics (ANTI RETURN TYPE ERROR)
-- Final stable version with safe return types and error handling

-- 3A) DROP dulu - hapus semua versi yang ada
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(json) CASCADE;

-- 3B) CREATE baru (STABIL RETURN)
CREATE FUNCTION public.get_my_referral_analytics()
RETURNS TABLE (
    referral_code TEXT,
    total_referrals BIGINT,
    last_7_days BIGINT,
    last_30_days BIGINT,
    invite_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    uid UUID := auth.uid();
    my_code TEXT;
    total_count BIGINT := 0;
    count_7d BIGINT := 0;
    count_30d BIGINT := 0;
    invite_status_value TEXT := 'ACTIVE';
    has_referrals_table BOOLEAN := FALSE;
    has_can_invite_column BOOLEAN := FALSE;
BEGIN
    -- Safety check: ensure user is authenticated
    IF uid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Ambil referral_code dari profiles
    SELECT p.referral_code INTO my_code
    FROM public.profiles p
    WHERE p.id = uid;

    -- Initialize return values
    referral_code := my_code;
    total_referrals := 0;
    last_7_days := 0;
    last_30_days := 0;
    invite_status := 'ACTIVE';

    -- Cek apakah tabel referrals ada (avoid error)
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'referrals'
    ) INTO has_referrals_table;

    -- Cek apakah kolom can_invite ada
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'can_invite'
    ) INTO has_can_invite_column;

    -- Hitung referrals hanya jika tabel ada
    IF has_referrals_table AND my_code IS NOT NULL THEN
        -- Cek struktur tabel referrals untuk avoid uuid=text error
        -- Method 1: Cek kolom referrer_code (text)
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'referrals' 
              AND column_name = 'referrer_code'
              AND data_type = 'text'
        ) THEN
            -- Hitung berdasarkan referrer_code (text)
            SELECT COUNT(*)::BIGINT INTO total_count
            FROM public.referrals
            WHERE referrer_code = my_code::TEXT;
            
            SELECT COUNT(*)::BIGINT INTO count_7d
            FROM public.referrals
            WHERE referrer_code = my_code::TEXT
              AND created_at >= NOW() - INTERVAL '7 days';
              
            SELECT COUNT(*)::BIGINT INTO count_30d
            FROM public.referrals
            WHERE referrer_code = my_code::TEXT
              AND created_at >= NOW() - INTERVAL '30 days';
        
        -- Method 2: Cek kolom referrer_id (uuid)
        ELSIF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'referrals' 
              AND column_name = 'referrer_id'
              AND data_type = 'uuid'
        ) THEN
            -- Hitung berdasarkan referrer_id (uuid)
            SELECT COUNT(*)::BIGINT INTO total_count
            FROM public.referrals
            WHERE referrer_id = uid;
            
            SELECT COUNT(*)::BIGINT INTO count_7d
            FROM public.referrals
            WHERE referrer_id = uid
              AND created_at >= NOW() - INTERVAL '7 days';
              
            SELECT COUNT(*)::BIGINT INTO count_30d
            FROM public.referrals
            WHERE referrer_id = uid
              AND created_at >= NOW() - INTERVAL '30 days';
        
        -- Method 3: Cek kolom referred_by (uuid) di profiles
        ELSIF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'profiles' 
              AND column_name = 'referred_by'
              AND data_type = 'uuid'
        ) THEN
            -- Hitung berdasarkan referred_by di profiles
            SELECT COUNT(*)::BIGINT INTO total_count
            FROM public.profiles
            WHERE referred_by = uid;
            
            SELECT COUNT(*)::BIGINT INTO count_7d
            FROM public.profiles
            WHERE referred_by = uid
              AND created_at >= NOW() - INTERVAL '7 days';
              
            SELECT COUNT(*)::BIGINT INTO count_30d
            FROM public.profiles
            WHERE referred_by = uid
              AND created_at >= NOW() - INTERVAL '30 days';
        
        -- Method 4: Cek kolom referred_by_code (text) di profiles
        ELSIF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'profiles' 
              AND column_name = 'referred_by_code'
              AND data_type = 'text'
        ) THEN
            -- Hitung berdasarkan referred_by_code di profiles
            SELECT COUNT(*)::BIGINT INTO total_count
            FROM public.profiles
            WHERE referred_by_code = my_code::TEXT;
            
            SELECT COUNT(*)::BIGINT INTO count_7d
            FROM public.profiles
            WHERE referred_by_code = my_code::TEXT
              AND created_at >= NOW() - INTERVAL '7 days';
              
            SELECT COUNT(*)::BIGINT INTO count_30d
            FROM public.profiles
            WHERE referred_by_code = my_code::TEXT
              AND created_at >= NOW() - INTERVAL '30 days';
        END IF;
    END IF;

    -- Set nilai return
    total_referrals := COALESCE(total_count, 0);
    last_7_days := COALESCE(count_7d, 0);
    last_30_days := COALESCE(count_30d, 0);

    -- Get invite status if column exists
    IF has_can_invite_column THEN
        SELECT 
            CASE 
                WHEN can_invite = TRUE THEN 'ACTIVE'
                WHEN can_invite = FALSE THEN 'INACTIVE'
                ELSE 'ACTIVE'
            END INTO invite_status_value
        FROM public.profiles
        WHERE id = uid;
    END IF;

    invite_status := COALESCE(invite_status_value, 'ACTIVE');

    -- Return the result
    RETURN NEXT;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO authenticated;

-- Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verification
SELECT 'Function get_my_referral_analytics rebuilt successfully' AS status;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'get_my_referral_analytics';

-- Test function (will return empty if no authenticated context)
SELECT 'Testing function (may return empty if no auth context):' AS test_info;
SELECT * FROM public.get_my_referral_analytics() LIMIT 1;
