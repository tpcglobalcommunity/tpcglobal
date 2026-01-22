-- =========================================================
-- PRODUCTION TESTING SCRIPT - TPC GLOBAL
-- =========================================================
-- Run this AFTER deploying the migration to verify all fixes
-- =========================================================

SELECT '=== PRODUCTION FIX VERIFICATION ===' as step;

-- 1. Test get_app_settings RPC
SELECT 'get_app_settings RPC Test' as test_name;
SELECT public.get_app_settings() as rpc_result;

-- 2. Verify profiles table structure
SELECT 'Profiles Table Verification' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('id', 'email', 'username', 'full_name', 'role', 'verified', 'status')
ORDER BY ordinal_position;

-- 3. Verify notifications table structure
SELECT 'Notifications Table Verification' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verify app_settings table and data
SELECT 'App Settings Verification' as test_name;
SELECT key, value, is_public, updated_at
FROM public.app_settings 
WHERE is_public = true
ORDER BY key;

-- 5. Test sample profile query (simulating frontend)
SELECT 'Profile Query Test' as test_name;
SELECT COUNT(*) as profile_count
FROM public.profiles;

-- 6. Test sample notification query
SELECT 'Notification Query Test' as test_name;
SELECT COUNT(*) as notification_count
FROM public.notifications;

-- 7. Check RLS policies
SELECT 'RLS Policies Check' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'notifications', 'app_settings')
ORDER BY schemaname, tablename, policyname;

-- 8. Check function permissions
SELECT 'Function Permissions Check' as test_name;
SELECT 
    routine_name,
    privilege_type,
    grantee
FROM information_schema.role_routine_grants 
WHERE routine_name = 'get_app_settings'
AND routine_schema = 'public';

SELECT '=== ALL TESTS COMPLETED ===' as step, now() as completed_at;

-- 9. Expected results summary
SELECT 'Expected Frontend Results' as info;
SELECT 
    'get_app_settings should return 200 with JSON' as expectation_1,
    'profiles.status column should exist (no missing column errors)' as expectation_2,
    'notifications table should exist (no 404s)' as expectation_3,
    'All queries should work without errors' as expectation_4;
