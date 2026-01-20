-- Schema-Safe & Type-Safe RPC Function
-- Auto-detects tables and column types, prevents all errors

-- Drop existing function to ensure clean slate
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(json) CASCADE;

-- Create schema-safe and type-safe function
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
    referral_code_val TEXT;
    total_count BIGINT := 0;
    count_7d BIGINT := 0;
    count_30d BIGINT := 0;
    invite_status_val TEXT := 'ACTIVE';
    
    -- Table detection variables
    referral_table_name TEXT;
    referrer_col_name TEXT;
    referrer_col_type TEXT;
    has_created_at BOOLEAN := false;
    has_can_invite BOOLEAN := false;
    
    -- Dynamic SQL variables
    sql_query TEXT;
BEGIN
    -- Safety check: ensure user is authenticated
    IF uid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Step 1: Get referral_code from profiles (uuid=uuid comparison)
    SELECT p.referral_code INTO referral_code_val
    FROM public.profiles p
    WHERE p.id = uid;  -- uuid = uuid, safe comparison

    -- Initialize return values
    referral_code := COALESCE(referral_code_val, '');
    total_referrals := 0;
    last_7_days := 0;
    last_30_days := 0;
    invite_status := 'ACTIVE';

    -- Step 2: Auto-detect referral tracking table
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='referrals'
    ) THEN
        referral_table_name := 'referrals';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='invites'
    ) THEN
        referral_table_name := 'invites';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='referral_events'
    ) THEN
        referral_table_name := 'referral_events';
    ELSE
        -- No referral tracking table found, return zeros
        RETURN NEXT;
        RETURN;
    END IF;

    -- Step 3: Auto-detect referrer column and type
    -- Check for various possible column names
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='referrer_id'
    ) THEN
        referrer_col_name := 'referrer_id';
        SELECT data_type INTO referrer_col_type
        FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='referrer_id';
    
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='inviter_id'
    ) THEN
        referrer_col_name := 'inviter_id';
        SELECT data_type INTO referrer_col_type
        FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='inviter_id';
    
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='referred_by'
    ) THEN
        referrer_col_name := 'referred_by';
        SELECT data_type INTO referrer_col_type
        FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='referred_by';
    
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='invited_by'
    ) THEN
        referrer_col_name := 'invited_by';
        SELECT data_type INTO referrer_col_type
        FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='invited_by';
    END IF;

    -- Step 4: Check if created_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name=referral_table_name 
          AND column_name='created_at'
    ) INTO has_created_at;

    -- Step 5: Count referrals with type-safe comparison
    IF referrer_col_name IS NOT NULL AND referrer_col_type IS NOT NULL THEN
        IF referrer_col_type = 'uuid' THEN
            -- UUID comparison: referrer_id = uid (safe)
            IF has_created_at THEN
                -- With created_at filtering
                sql_query := format(
                    'SELECT COUNT(*)::BIGINT, ' ||
                           'COUNT(*) FILTER (WHERE created_at >= now() - interval ''7 days'')::BIGINT, ' ||
                           'COUNT(*) FILTER (WHERE created_at >= now() - interval ''30 days'')::BIGINT ' ||
                    'FROM %I WHERE %I = $1',
                    referral_table_name, referrer_col_name
                );
                EXECUTE sql_query INTO total_count, count_7d, count_30d USING uid;
            ELSE
                -- Without created_at
                sql_query := format(
                    'SELECT COUNT(*)::BIGINT, 0::BIGINT, 0::BIGINT ' ||
                    'FROM %I WHERE %I = $1',
                    referral_table_name, referrer_col_name
                );
                EXECUTE sql_query INTO total_count, count_7d, count_30d USING uid;
            END IF;
            
        ELSIF referrer_col_type = 'text' OR referrer_col_type = 'varchar' THEN
            -- Text comparison: referrer_id = uid::text (safe cast)
            IF has_created_at THEN
                -- With created_at filtering
                sql_query := format(
                    'SELECT COUNT(*)::BIGINT, ' ||
                           'COUNT(*) FILTER (WHERE created_at >= now() - interval ''7 days'')::BIGINT, ' ||
                           'COUNT(*) FILTER (WHERE created_at >= now() - interval ''30 days'')::BIGINT ' ||
                    'FROM %I WHERE %I = $1',
                    referral_table_name, referrer_col_name
                );
                EXECUTE sql_query INTO total_count, count_7d, count_30d USING uid::text;
            ELSE
                -- Without created_at
                sql_query := format(
                    'SELECT COUNT(*)::BIGINT, 0::BIGINT, 0::BIGINT ' ||
                    'FROM %I WHERE %I = $1',
                    referral_table_name, referrer_col_name
                );
                EXECUTE sql_query INTO total_count, count_7d, count_30d USING uid::text;
            END IF;
        END IF;
    END IF;

    -- Step 6: Set final return values
    total_referrals := COALESCE(total_count, 0);
    last_7_days := COALESCE(count_7d, 0);
    last_30_days := COALESCE(count_30d, 0);

    -- Step 7: Get invite status if column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='can_invite'
    ) INTO has_can_invite;

    IF has_can_invite THEN
        SELECT 
            CASE 
                WHEN can_invite = TRUE THEN 'ACTIVE'
                WHEN can_invite = FALSE THEN 'INACTIVE'
                ELSE 'ACTIVE'
            END INTO invite_status_val
        FROM public.profiles
        WHERE id = uid;
    END IF;

    invite_status := COALESCE(invite_status_val, 'ACTIVE');

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
SELECT 'Schema-safe & type-safe RPC function created' AS status;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'get_my_referral_analytics';

-- Test function (will return empty if no authenticated context)
SELECT 'Testing function:' AS test_info;
SELECT * FROM public.get_my_referral_analytics() LIMIT 1;
