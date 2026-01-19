-- Check triggers that might be causing the signup failure
-- Filter untuk menghindari noise dari internal triggers

-- Check auth.users triggers (most likely culprit)
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- Check profiles triggers (additional info)
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'profiles'
  AND NOT t.tgisinternal;

-- Expected: Jika ada trigger “create profile” di auth.users → konfirmasi penyebab
-- Fix: Perbaiki trigger untuk handle NULL dengan coalesce() atau drop NOT NULL constraints
