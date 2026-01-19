-- ANALYZE ALL CONSTRAINTS ON auth.users AND REFERENCES TO IT
-- This will show all constraints that might cause 500 errors during signup

-- 1. Foreign keys pointing TO auth.users (what references users table)
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth'
ORDER BY tc.table_schema, tc.table_name;

-- 2. Foreign keys FROM auth.users (what users table references)
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users'
  AND tc.table_schema = 'auth'
ORDER BY tc.table_schema, tc.table_name;

-- 3. All constraints ON auth.users table
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
  tc.initially_deferred
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'users'
  AND tc.table_schema = 'auth'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. Check for NOT NULL constraints on auth.users
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'auth'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;

-- 5. Check if profiles table has constraints that might fail during trigger
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
  tc.initially_deferred
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'profiles'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;
