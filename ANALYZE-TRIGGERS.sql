-- ANALYZE ALL TRIGGERS ON auth.users (INCLUDING INTERNAL)
-- This will show ALL triggers including internal PostgreSQL triggers

SELECT
  t.tgname,
  t.tgenabled,
  t.tgisinternal,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'ENABLED'
    WHEN t.tgenabled = 'D' THEN 'DISABLED'
    ELSE 'UNKNOWN'
  END as status_text,
  CASE 
    WHEN t.tgisinternal THEN 'INTERNAL'
    ELSE 'CUSTOM'
  END as trigger_type,
  p.proname AS function_name,
  n.nspname AS function_schema
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace ns ON ns.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE ns.nspname = 'auth'
  AND c.relname = 'users'
ORDER BY t.tgisinternal DESC, t.tgname;

-- Also check for any functions that might be called by triggers
SELECT 
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_userbyid(p.proowner) as owner,
  p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'auth' 
AND (p.proname LIKE '%user%' OR p.proname LIKE '%profile%' OR p.proname LIKE '%trigger%')
ORDER BY p.proname;

-- Check if there are any constraints that might cause issues
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  CASE 
    WHEN contype = 'f' THEN 'FOREIGN KEY'
    WHEN contype = 'p' THEN 'PRIMARY KEY'
    WHEN contype = 'u' THEN 'UNIQUE'
    WHEN contype = 'c' THEN 'CHECK'
    ELSE contype
  END as constraint_type_text
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth'))
ORDER BY conname;
