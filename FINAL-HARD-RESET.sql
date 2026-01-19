-- FINAL HARD RESET - CLEAN ALL CUSTOM TRIGGERS FROM auth.users
-- This will completely remove all custom triggers and functions

-- Step 1: Drop ALL custom triggers on auth.users
DROP TRIGGER IF EXISTS tpc_on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tpc_on_auth_user_created_failopen ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;

-- Step 2: Drop ALL custom functions (both public and auth schemas)
DROP FUNCTION IF EXISTS public.tpc_on_auth_user_created_failopen();
DROP FUNCTION IF EXISTS public.tpc_handle_new_user_profiles();
DROP FUNCTION IF EXISTS public.create_user_profile();
DROP FUNCTION IF EXISTS public.sync_user_profile();
DROP FUNCTION IF EXISTS auth.tpc_on_auth_user_created_failopen();
DROP FUNCTION IF EXISTS auth.tpc_handle_new_user_profiles();
DROP FUNCTION IF EXISTS auth.create_user_profile();
DROP FUNCTION IF EXISTS auth.sync_user_profile();

-- Step 3: Verify NO custom triggers remain on auth.users
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status,
    t.tgisinternal as is_internal,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        WHEN t.tgenabled = 'D' THEN 'DISABLED'
        ELSE 'UNKNOWN'
    END as status_text,
    CASE 
        WHEN t.tgisinternal THEN 'INTERNAL'
        ELSE 'CUSTOM'
    END as trigger_type
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Step 4: Verify NO custom functions remain
SELECT 
    p.proname as function_name,
    n.nspname as schema_name,
    pg_get_userbyid(p.proowner) as owner
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE (n.nspname = 'public' OR n.nspname = 'auth')
AND (
    p.proname LIKE '%tpc_%' OR 
    p.proname LIKE '%user_profile%' OR 
    p.proname LIKE '%auth_user%' OR
    p.proname LIKE '%handle_new_user%' OR
    p.proname LIKE '%create_user_profile%' OR
    p.proname LIKE '%sync_user_profile%'
)
ORDER BY n.nspname, p.proname;

-- Step 5: Test that auth.users is clean
SELECT 
    'auth.users table is clean' as status,
    (SELECT COUNT(*) FROM pg_trigger t
     JOIN pg_class c ON c.oid = t.tgrelid
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal) as custom_triggers_count;

COMMIT;
