-- Query untuk cek struktur tabel profiles
-- Jalankan ini di Supabase SQL Editor

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Query untuk cek apakah trigger sudah terpasang dengan benar
SELECT 
    tgname as trigger_name,
    tgenabled as is_enabled,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Query untuk test trigger (jalankan setelah fix)
-- Simulasi signup test
SELECT 
    p.id,
    p.email,
    p.username,
    p.referral_code,
    p.status,
    p.created_at
FROM public.profiles p 
WHERE p.email = 'test@example.com'  -- ganti dengan email test
ORDER BY p.created_at DESC 
LIMIT 5;
