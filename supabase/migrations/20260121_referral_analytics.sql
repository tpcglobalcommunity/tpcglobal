-- Referral Analytics Migration
-- Fixes RPC function, schema-safe queries, and frontend integration
-- Author: AI Assistant  
-- Date: 2026-01-21

BEGIN;

-- Ensure required columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Drop all existing function versions to avoid return type conflicts
DROP FUNCTION IF EXISTS public.get_my_referral_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_referral_analytics(json) CASCADE;

-- Create stable analytics function with auto-detection
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
    code TEXT;
    referral_table_name TEXT;
    referrer_col_name TEXT;
    referrer_col_type TEXT;
    has_created_at BOOLEAN := false;
    total_count BIGINT := 0;
    count_7d BIGINT := 0;
    count_30d BIGINT := 0;
    has_can_invite BOOLEAN := false;
BEGIN
    -- Safety check: ensure user is authenticated
    IF uid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get referral_code from profiles
    SELECT p.referral_code INTO code
    FROM public.profiles p
    WHERE p.id = uid;

    -- Set defaults
    referral_code := COALESCE(code, '');
    invite_status := 'ACTIVE';

    -- Auto-detect referral tracking table
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
        referral_table_name := NULL;
    END IF;

    -- If referral table exists, count referrals
    IF referral_table_name IS NOT NULL THEN
        -- Detect referrer column and type
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
              AND column_name='referrer_code'
        ) THEN
            referrer_col_name := 'referrer_code';
            SELECT data_type INTO referrer_col_type
            FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name=referral_table_name 
              AND column_name='referrer_code';
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name='profiles' 
              AND column_name='referred_by'
        ) THEN
            referral_table_name := 'profiles';
            referrer_col_name := 'referred_by';
            SELECT data_type INTO referrer_col_type
            FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name='profiles' 
              AND column_name='referred_by';
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name='profiles' 
              AND column_name='referred_by_code'
        ) THEN
            referral_table_name := 'profiles';
            referrer_col_name := 'referred_by_code';
            SELECT data_type INTO referrer_col_type
            FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name='profiles' 
              AND column_name='referred_by_code';
        END IF;

        -- Check for created_at column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='public' 
              AND table_name=referral_table_name 
              AND column_name='created_at'
        ) INTO has_created_at;

        -- Count referrals with proper casting
        IF referrer_col_name IS NOT NULL THEN
            IF referrer_col_type = 'uuid' THEN
                IF has_created_at THEN
                    execute format('
                        select count(*)::bigint, 
                               count(*) filter (where created_at >= now() - interval ''7 days'')::bigint,
                               count(*) filter (where created_at >= now() - interval ''30 days'')::bigint
                        from %I 
                        where %I = $1',
                        referral_table_name, referrer_col_name
                    ) into total_count, count_7d, count_30d
                    using uid;
                ELSE
                    execute format('
                        select count(*)::bigint, 0::bigint, 0::bigint
                        from %I 
                        where %I = $1',
                        referral_table_name, referrer_col_name
                    ) into total_count, count_7d, count_30d
                    using uid;
                END IF;
            ELSIF referrer_col_type = 'text' THEN
                IF has_created_at THEN
                    execute format('
                        select count(*)::bigint,
                               count(*) filter (where created_at >= now() - interval ''7 days'')::bigint,
                               count(*) filter (where created_at >= now() - interval ''30 days'')::bigint
                        from %I 
                        where %I = $1',
                        referral_table_name, referrer_col_name
                    ) into total_count, count_7d, count_30d
                    using uid::text;
                ELSE
                    execute format('
                        select count(*)::bigint, 0::bigint, 0::bigint
                        from %I 
                        where %I = $1',
                        referral_table_name, referrer_col_name
                    ) into total_count, count_7d, count_30d
                    using uid::text;
                END IF;
            END IF;
        END IF;
    END IF;

    -- Set return values
    total_referrals := COALESCE(total_count, 0);
    last_7_days := COALESCE(count_7d, 0);
    last_30_days := COALESCE(count_30d, 0);

    -- Get invite status if column exists
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
            END INTO invite_status
        FROM public.profiles
        WHERE id = uid;
    END IF;

    invite_status := COALESCE(invite_status, 'ACTIVE');

    RETURN NEXT;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.get_my_referral_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referral_analytics() TO authenticated;

-- Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Backfill existing users without referral codes
UPDATE public.profiles
SET referral_code = 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8))
WHERE referral_code IS NULL 
   OR referral_code = '' 
   OR referral_code = 'REFERRAL_CODE_NOT_AVAILABLE';

COMMIT;

-- Verification
SELECT 'Referral analytics migration completed' AS status;

-- Check function
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'get_my_referral_analytics';
