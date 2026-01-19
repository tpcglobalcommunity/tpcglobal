-- Check profiles table structure - DIAGNOSIS STEP (WAJIB)
-- Lihat kolom mana yang NOT NULL dan mungkin menyebabkan signup gagal
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

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
