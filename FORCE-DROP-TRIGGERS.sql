-- FORCE DROP ALL TRIGGERS ON auth.users
-- This will completely remove all triggers that cause 500 errors

-- Step 1: Drop ALL triggers on auth.users
DROP TRIGGER IF EXISTS tpc_on_auth_user_created_failopen ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS auth_users_id_fkey ON auth.users;
DROP TRIGGER IF EXISTS auth_users_email_key ON auth.users;

-- Step 2: Drop ALL functions
DROP FUNCTION IF EXISTS tpc_on_auth_user_created_failopen();
DROP FUNCTION IF EXISTS on_auth_user_created();

-- Step 3: Verify NO triggers remain on auth.users
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as status,
    CASE 
        WHEN t.tgenabled = 'O' THEN 'ENABLED'
        ELSE 'DISABLED'
    END as status_text
FROM pg_trigger t 
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'users' 
AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

-- Step 4: Check if profiles table exists and has required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

COMMIT;
