-- INTEGRATE ENSURE_REFERRAL_CODE INTO get_my_referral_analytics
-- Updates the RPC function to auto-generate referral codes when null

BEGIN;

-- Drop existing function to recreate with integration
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;

-- Create enhanced function with auto-generation
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
    my_uid UUID := auth.uid();
    my_code TEXT;
    has_can_invite BOOLEAN := false;
    has_referred_by_column BOOLEAN := false;
    has_referred_by_code_column BOOLEAN := false;
    referral_count BIGINT := 0;
    referral_count_7d BIGINT := 0;
    referral_count_30d BIGINT := 0;
    invite_status_value TEXT := 'ACTIVE';
BEGIN
    -- Safety check: ensure user is authenticated
    IF my_uid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get user's referral code, auto-generate if needed
    SELECT p.referral_code INTO my_code
    FROM public.profiles p
    WHERE p.id = my_uid;

    -- Auto-generate referral code if null/empty
    IF my_code IS NULL OR my_code = '' OR my_code = 'REFERRAL_CODE_NOT_AVAILABLE' THEN
        -- Call ensure_referral_code to generate unique code
        SELECT public.ensure_referral_code() INTO my_code;
    END IF;

    -- Initialize return values
    referral_code := my_code;
    total_referrals := 0;
    last_7_days := 0;
    last_30_days := 0;
    invite_status := 'ACTIVE';

    -- Check which columns exist for compatibility
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='can_invite'
    ) INTO has_can_invite;

    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='referred_by'
    ) INTO has_referred_by_column;

    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='referred_by_code'
    ) INTO has_referred_by_code_column;

    -- Count total referrals based on available columns
    -- Method 1: Check referred_by_code (text column)
    IF has_referred_by_code_column AND my_code IS NOT NULL THEN
        SELECT COUNT(*)::BIGINT INTO referral_count
        FROM public.profiles
        WHERE referred_by_code = my_code::TEXT;
        
        SELECT COUNT(*)::BIGINT INTO referral_count_7d
        FROM public.profiles
        WHERE referred_by_code = my_code::TEXT
          AND created_at >= NOW() - INTERVAL '7 days';
          
        SELECT COUNT(*)::BIGINT INTO referral_count_30d
        FROM public.profiles
        WHERE referred_by_code = my_code::TEXT
          AND created_at >= NOW() - INTERVAL '30 days';
    
    -- Method 2: Check referred_by (uuid column) 
    ELSIF has_referred_by_column THEN
        SELECT COUNT(*)::BIGINT INTO referral_count
        FROM public.profiles
        WHERE referred_by = my_uid;
        
        SELECT COUNT(*)::BIGINT INTO referral_count_7d
        FROM public.profiles
        WHERE referred_by = my_uid
          AND created_at >= NOW() - INTERVAL '7 days';
          
        SELECT COUNT(*)::BIGINT INTO referral_count_30d
        FROM public.profiles
        WHERE referred_by = my_uid
          AND created_at >= NOW() - INTERVAL '30 days';
    END IF;

    -- Set the return values
    total_referrals := COALESCE(referral_count, 0);
    last_7_days := COALESCE(referral_count_7d, 0);
    last_30_days := COALESCE(referral_count_30d, 0);

    -- Get invite status if column exists
    IF has_can_invite THEN
        SELECT 
            CASE 
                WHEN can_invite = TRUE THEN 'ACTIVE'
                WHEN can_invite = FALSE THEN 'INACTIVE'
                ELSE 'ACTIVE'
            END INTO invite_status_value
        FROM public.profiles
        WHERE id = my_uid;
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

COMMIT;

-- Verification queries
SELECT 'Enhanced get_my_referral_analytics with auto-generation created successfully' AS status;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname IN ('get_my_referral_analytics', 'ensure_referral_code')
ORDER BY proname;
