-- =========================================================
-- AUDIT STRUKTUR LENGKAP: public.profiles (Supabase)
-- =========================================================

-- 1) Kolom lengkap + default + not null
SELECT
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name   = 'profiles'
ORDER BY c.ordinal_position;

-- 2) Constraint detail (PK, UNIQUE, FK, CHECK) + referensi FK
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name   AS foreign_table_name,
  ccu.column_name  AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema    = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema    = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name   = 'profiles'
ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position;

-- 3) Index lengkap (lebih detail daripada pg_indexes)
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename  = 'profiles'
ORDER BY indexname;

-- 4) RLS status + policies
SELECT
  n.nspname AS schemaname,
  c.relname AS tablename,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'profiles';

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
WHERE schemaname = 'public'
  AND tablename  = 'profiles'
ORDER BY policyname;

-- 5) Trigger terkait: auth.users & public.profiles (yang paling penting)
-- A) Triggers di auth.users
SELECT
  tg.tgname AS trigger_name,
  pg_get_triggerdef(tg.oid, true) AS trigger_def,
  p.proname AS function_name
FROM pg_trigger tg
JOIN pg_proc p ON p.oid = tg.tgfoid
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT tg.tgisinternal
ORDER BY tg.tgname;

-- B) Triggers di public.profiles
SELECT
  tg.tgname AS trigger_name,
  pg_get_triggerdef(tg.oid, true) AS trigger_def,
  p.proname AS function_name
FROM pg_trigger tg
JOIN pg_proc p ON p.oid = tg.tgfoid
JOIN pg_class c ON c.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'profiles'
  AND NOT tg.tgisinternal
ORDER BY tg.tgname;
