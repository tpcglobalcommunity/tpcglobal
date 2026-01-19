-- VERIFY SIGNUP DATA STRUCTURE
-- Check if the metadata structure matches what the frontend is sending

-- 1. Check auth.users table structure to see what raw_user_meta_data can contain
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
AND column_name IN ('raw_user_meta_data', 'email', 'id')
ORDER BY ordinal_position;

-- 2. Check profiles table structure to see what fields are required
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if there are any constraints on profiles table that might fail
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. Test the exact metadata structure that frontend sends
-- This simulates what happens when signup is called with:
-- options: { data: { full_name, username, referral_code } }

DO $$
DECLARE
    test_metadata jsonb;
BEGIN
    -- Simulate the metadata structure from frontend
    test_metadata := '{
        "full_name": "Test User",
        "username": "testuser", 
        "referral_code": "TPC-BOOT01"
    }'::jsonb;
    
    -- Test extracting values like a trigger would
    RAISE NOTICE 'Full Name: %', test_metadata->>'full_name';
    RAISE NOTICE 'Username: %', test_metadata->>'username';
    RAISE NOTICE 'Referral Code: %', test_metadata->>'referral_code';
    
    -- Test if all required fields are present
    IF test_metadata ? 'full_name' AND test_metadata ? 'username' AND test_metadata ? 'referral_code' THEN
        RAISE NOTICE '✅ All required fields present in metadata';
    ELSE
        RAISE NOTICE '❌ Missing required fields in metadata';
    END IF;
END $$;

-- 5. Check if there are any existing users to see successful signup patterns
SELECT 
    id,
    email,
    created_at,
    CASE 
        WHEN raw_user_meta_data IS NOT NULL THEN 'Has metadata'
        ELSE 'No metadata'
    END as metadata_status,
    raw_user_meta_data::text as metadata_sample
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
