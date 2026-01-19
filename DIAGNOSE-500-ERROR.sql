-- COMPREHENSIVE 500 ERROR DIAGNOSIS
-- Find the EXACT cause of "Database error saving new user"

-- 1. Check ALL triggers currently active on auth.users
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status_code,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        WHEN t.tgenabled = 'D' THEN 'DISABLED'
        ELSE 'UNKNOWN'
    END as status_text,
    t.tgisinternal as is_internal,
    CASE 
        WHEN t.tgisinternal THEN 'INTERNAL (PostgreSQL)'
        ELSE 'CUSTOM (User-created)'
    END as trigger_type,
    p.proname as function_name,
    n.nspname as function_schema
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE ns.nspname = 'auth' AND c.relname = 'users'
ORDER BY t.tgisinternal, t.tgenabled DESC, t.tgname;

-- 2. Check function source code for any custom triggers
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    pg_get_functiondef(p.oid) as full_function_code,
    pg_get_userbyid(p.proowner) as owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'auth')
AND (
    p.proname LIKE '%user%' OR 
    p.proname LIKE '%profile%' OR 
    p.proname LIKE '%auth%' OR
    p.proname LIKE '%trigger%' OR
    p.proname LIKE '%signup%'
)
ORDER BY n.nspname, p.proname;

-- 3. Check for any RLS policies that might block inserts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'auth'
ORDER BY policyname;

-- 4. Check auth.users table constraints in detail
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    CASE 
        WHEN tc.constraint_type = 'p' THEN 'PRIMARY KEY'
        WHEN tc.constraint_type = 'u' THEN 'UNIQUE'
        WHEN tc.constraint_type = 'c' THEN 'CHECK'
        WHEN tc.constraint_type = 'f' THEN 'FOREIGN KEY'
        ELSE tc.constraint_type
    END as constraint_type_text,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred,
    cc.check_clause as constraint_definition
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_name = 'users' AND tc.table_schema = 'auth'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 5. Check profiles table constraints (if trigger tries to insert here)
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    CASE 
        WHEN tc.constraint_type = 'p' THEN 'PRIMARY KEY'
        WHEN tc.constraint_type = 'u' THEN 'UNIQUE'
        WHEN tc.constraint_type = 'c' THEN 'CHECK'
        WHEN tc.constraint_type = 'f' THEN 'FOREIGN KEY'
        ELSE tc.constraint_type
    END as constraint_type_text,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred,
    cc.check_clause as constraint_definition
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
    AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_name = 'profiles' AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 6. Test manual insert to auth.users (this should work)
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'test-' || extract(epoch from now()) || '@example.com';
BEGIN
    -- Try to insert directly into auth.users
    INSERT INTO auth.users (
        id, 
        email, 
        created_at, 
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        test_email,
        now(),
        now(),
        '{"full_name": "Test User", "username": "testuser", "referral_code": "TPC-BOOT01"}'::jsonb
    );
    
    RAISE NOTICE '✅ Direct insert to auth.users SUCCESS';
    RAISE NOTICE 'Test user ID: %', test_user_id;
    RAISE NOTICE 'Test email: %', test_email;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Direct insert to auth.users FAILED: %', SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
END $$;

-- 7. Check recent error logs (if available)
-- Note: This might not work in Supabase, but worth trying
SELECT 
    log_time,
    username,
    database,
    pid,
    session_id,
    line_num,
    command_tag,
    session_start_time,
    virtual_transaction_id,
    transaction_id,
    error_severity,
    sql_state_code,
    message,
    detail,
    hint,
    internal_query,
    internal_query_pos,
    context,
    query,
    query_pos,
    location,
    application_name
FROM pg_log_error_logs 
WHERE command_tag = 'INSERT'
  AND database = current_database()
ORDER BY log_time DESC
LIMIT 10;
