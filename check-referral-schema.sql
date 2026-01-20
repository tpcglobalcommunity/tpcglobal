-- B1: SCHEMA INSPECTION - RUN THIS FIRST
-- Check existing functions, tables, and column types related to referrals

-- 1. Check existing functions with similar names
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type,
    prosrc AS function_source
FROM pg_proc 
WHERE proname ILIKE '%referral%' 
   OR proname ILIKE '%analytics%'
   OR proname ILIKE '%invite%'
ORDER BY proname;

-- 2. Check tables related to referrals
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename ILIKE '%referral%' 
   OR tablename ILIKE '%invite%' 
   OR tablename ILIKE '%profile%'
   OR tablename ILIKE '%member%'
   AND schemaname = 'public'
ORDER BY tablename;

-- 3. Check columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
   AND table_schema = 'public'
   AND (column_name ILIKE '%referral%' 
        OR column_name ILIKE '%invite%' 
        OR column_name ILIKE '%code%'
        OR column_name = 'id')
ORDER BY column_name;

-- 4. Check columns in potential referral tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
   AND table_name ILIKE '%referral%'
   AND (column_name ILIKE '%referral%' 
        OR column_name ILIKE '%invite%' 
        OR column_name ILIKE '%code%'
        OR column_name ILIKE '%user%'
        OR column_name ILIKE '%by%'
        OR column_name = 'created_at'
        OR column_name = 'id')
ORDER BY table_name, column_name;

-- 5. Check foreign key relationships
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
   AND (tc.table_name ILIKE '%referral%' 
        OR tc.table_name ILIKE '%profile%')
   AND tc.table_schema = 'public';

-- 6. Sample data inspection (first 5 rows)
DO $$
DECLARE
    table_name TEXT;
    sql_query TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename ILIKE '%referral%'
        LIMIT 3
    LOOP
        sql_query := format('SELECT * FROM public.%I LIMIT 5;', table_name);
        RAISE NOTICE '=== SAMPLE DATA FOR TABLE: % ===', table_name;
        EXECUTE sql_query;
    END LOOP;
END $$;

-- 7. Check if can_invite column exists
SELECT 
    EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' 
          AND table_name='profiles' 
          AND column_name='can_invite'
    ) AS has_can_invite_column;
