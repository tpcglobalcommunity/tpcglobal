-- =========================================================
-- DEBUG PRODUCTION ERRORS - TPC GLOBAL
-- =========================================================
-- Comprehensive debugging for remaining issues
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== DEBUGGING PRODUCTION ERRORS ===' as step;
SELECT current_database() as database_name, now() as debug_time;

-- 2. CHECK IF get_app_settings EXISTS AND WORKS
SELECT '=== get_app_settings DEBUG ===' as step;
SELECT 
    proname as function_name,
    pronargs as num_args,
    prosrc as source_exists
FROM pg_proc 
WHERE proname = 'get_app_settings'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Test function call
DO $$
BEGIN
    DECLARE
        result JSONB;
    BEGIN
        SELECT public.get_app_settings() INTO result;
        RAISE NOTICE 'get_app_settings() SUCCESS: %', result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'get_app_settings() ERROR: %', SQLERRM;
    END;
END $$;

-- 3. CHECK app_settings TABLE
SELECT '=== app_settings TABLE DEBUG ===' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check table data
SELECT key, value, is_public, updated_at
FROM public.app_settings 
ORDER BY key;

-- 4. CHECK profiles TABLE FOR status COLUMN
SELECT '=== profiles TABLE DEBUG ===' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'status';

-- Check if status column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'profiles.status column EXISTS';
    ELSE
        RAISE NOTICE 'profiles.status column MISSING';
    END IF;
END $$;

-- 5. CHECK notifications TABLE
SELECT '=== notifications TABLE DEBUG ===' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'notifications table EXISTS';
    ELSE
        RAISE NOTICE 'notifications table MISSING';
    END IF;
END $$;

-- 6. CHECK RLS POLICIES
SELECT '=== RLS POLICIES DEBUG ===' as step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('app_settings', 'profiles', 'notifications')
ORDER BY schemaname, tablename, policyname;

-- 7. CHECK FUNCTION PERMISSIONS
SELECT '=== FUNCTION PERMISSIONS DEBUG ===' as step;
SELECT 
    routine_name,
    privilege_type,
    grantee
FROM information_schema.role_routine_grants 
WHERE routine_name = 'get_app_settings'
AND routine_schema = 'public';

-- 8. TEST ACTUAL QUERIES THAT FRONTEND USES
SELECT '=== FRONTEND QUERY TESTS ===' as step;

-- Test 1: get_app_settings RPC
DO $$
BEGIN
    DECLARE
        result JSONB;
    BEGIN
        -- Simulate frontend RPC call
        SELECT public.get_app_settings() INTO result;
        RAISE NOTICE 'FRONTEND RPC TEST SUCCESS: %', result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'FRONTEND RPC TEST FAILED: %', SQLERRM;
    END;
END $$;

-- Test 2: profiles query with status
DO $$
BEGIN
    DECLARE
        profile_count INTEGER;
    BEGIN
        -- Simulate frontend profile query
        SELECT COUNT(*) INTO profile_count
        FROM public.profiles
        WHERE status IS NOT NULL;
        RAISE NOTICE 'PROFILES STATUS QUERY SUCCESS: % profiles with status', profile_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'PROFILES STATUS QUERY FAILED: %', SQLERRM;
    END;
END $$;

-- Test 3: notifications query
DO $$
BEGIN
    DECLARE
        notification_count INTEGER;
    BEGIN
        -- Simulate frontend notifications query
        SELECT COUNT(*) INTO notification_count
        FROM public.notifications;
        RAISE NOTICE 'NOTIFICATIONS QUERY SUCCESS: % notifications', notification_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'NOTIFICATIONS QUERY FAILED: %', SQLERRM;
    END;
END $$;

-- 9. CHECK FOR COMMON ERRORS
SELECT '=== COMMON ERRORS CHECK ===' as step;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('app_settings', 'profiles', 'notifications')
AND schemaname = 'public';

-- Check for orphaned objects
SELECT '=== ORPHANED OBJECTS CHECK ===' as step;
SELECT 
    proname,
    pronargs
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname LIKE '%get_app_settings%'
ORDER BY proname;

SELECT '=== DEBUG COMPLETE ===' as step, now() as debug_completed_at;

-- 10. RECOMMENDATIONS
SELECT '=== RECOMMENDATIONS ===' as step;
SELECT 
    'Run this script in production Supabase SQL Editor' as step_1,
    'Check NOTICE messages for specific errors' as step_2,
    'Fix any missing tables/columns identified' as step_3,
    'Verify all functions return expected results' as step_4;
