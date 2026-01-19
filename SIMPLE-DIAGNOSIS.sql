-- SIMPLE 500 ERROR DIAGNOSIS
-- Focus only on the most important queries

-- 1. Check triggers on auth.users
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status_text,
    t.tgisinternal as is_internal
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users'
ORDER BY t.tgisinternal, t.tgname;

-- 2. Test manual insert to auth.users
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
    
    RAISE NOTICE '✅ Direct insert SUCCESS';
    RAISE NOTICE 'Test user ID: %', test_user_id;
    RAISE NOTICE 'Test email: %', test_email;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Direct insert FAILED: %', SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
END $$;
