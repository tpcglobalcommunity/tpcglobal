-- =========================================================
-- VERIFY ENV VARIABLES - TPC GLOBAL
-- =========================================================
-- Script to verify Supabase client is using correct ENV
-- =========================================================

SELECT '=== VERIFYING ENV VARIABLES ===' as step;

-- Check current database connection
SELECT 
    'Database Connection' as check,
    current_database() as database_name,
    version() as postgres_version,
    now() as connection_time;

-- Check if we're connected to the right project
SELECT 
    'Project Verification' as check,
    'nhscvoqyjtpaskeqaths.supabase.co' as expected_project,
    'Check if this matches your Supabase project' as instruction;

-- Test basic connection
SELECT 
    'Connection Test' as check,
    'SELECT 1 as test' as query,
    'Should return 1' as expected_result;

-- Test if we can create a simple function
SELECT 
    'Function Creation Test' as check,
    'Creating test function' as action;

CREATE OR REPLACE FUNCTION public.env_test()
RETURNS TEXT
LANGUAGE sql
AS $$
    SELECT 'ENV TEST SUCCESS - Connected to ' || current_database() as result;
$$;

-- Test the function
SELECT 
    'Function Execution Test' as check,
    public.env_test() as result;

-- Clean up test function
DROP FUNCTION IF EXISTS public.env_test();

SELECT 
    'Environment Variables' as check,
    'VITE_SUPABASE_URL should be: https://nhscvoqyjtpaskeqaths.supabase.co' as expected_url,
    'VITE_SUPABASE_ANON_KEY should be the anon key from that project' as expected_key;

SELECT 
    'Frontend Verification' as check,
    'Check browser console for Supabase Config log' as instruction_1,
    'Should show the correct URL and hasKey: true' as instruction_2;

SELECT '=== ENV VERIFICATION COMPLETE ===' as step, now() as completed_at;

-- Instructions for frontend
SELECT '=== FRONTEND DEBUGGING ===' as step;
SELECT 
    '1. Open https://tpcglobal.io/en/home' as step_1,
    '2. Open DevTools → Console' as step_2,
    '3. Look for "🔧 Supabase Config:" log' as step_3,
    '4. Verify URL matches nhscvoqyjtpaskeqaths.supabase.co' as step_4,
    '5. Verify hasKey: true' as step_5,
    '6. Check Network tab for get_app_settings requests' as step_6;
