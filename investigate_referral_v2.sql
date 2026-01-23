-- =====================================================
-- INVESTIGASI REFERRAL VALIDATION TPC-BOOT01 (SAFE v2)
-- Jalankan di Supabase SQL Editor
-- =====================================================

-- 0) Pastikan extension crypto tersedia (umumnya sudah)
-- select * from pg_extension where extname in ('pgcrypto');

-- =====================================================
-- 1) Test RPC function langsung (hasil TRUE/FALSE)
-- =====================================================
select public.validate_referral_code_public('TPC-BOOT01') as boot01_upper;
select public.validate_referral_code_public('tpc-boot01') as boot01_lower;
select public.validate_referral_code_public('TPC-boot01') as boot01_mixed;

-- =====================================================
-- 2) Cek definisi function yang PASTI lengkap
-- =====================================================
select
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_sql
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'validate_referral_code_public';

-- =====================================================
-- 3) Cek owner + security definer + search_path setting
-- =====================================================
select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as is_security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'validate_referral_code_public';

-- =====================================================
-- 4) Cek GRANT execute (anon/authenticated)
-- =====================================================
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and routine_name = 'validate_referral_code_public'
order by grantee, privilege_type;

-- =====================================================
-- 5) Cari data BOOT01 di public.profiles (case-insensitive)
-- =====================================================
select 
  id, email, username, referral_code, role, status, verified, can_invite,
  created_at, updated_at
from public.profiles
where upper(trim(referral_code)) = 'TPC-BOOT01'
limit 50;

-- =====================================================
-- 6) Manual test query (cek beberapa variasi status)
--    Ini buat tahu masalahnya di "data" atau di "logic"
-- =====================================================

-- 6a) EXISTS tanpa status filter (apakah code ada sama sekali?)
select exists (
  select 1
  from public.profiles
  where upper(trim(referral_code)) = 'TPC-BOOT01'
) as boot01_exists_any_status;

-- 6b) Hitung status apa saja yang ada pada BOOT01
select
  status,
  count(*) as cnt
from public.profiles
where upper(trim(referral_code)) = 'TPC-BOOT01'
group by status
order by cnt desc;

-- 6c) Jika function kamu memfilter status='ACTIVE', pastikan ada record ACTIVE
select exists (
  select 1
  from public.profiles
  where upper(trim(referral_code)) = 'TPC-BOOT01'
    and status = 'ACTIVE'
) as boot01_exists_active;

-- =====================================================
-- 7) Cek referral_codes table (tanpa DO block)
-- =====================================================
select
  exists (
    select 1
    from information_schema.tables
    where table_schema='public' and table_name='referral_codes'
  ) as has_referral_codes_table;

-- =====================================================
-- 8) Debug: Top referral_code usage (biar tahu format yang tersimpan)
-- =====================================================
select 
  referral_code,
  count(*) as usage_count,
  max(created_at) as latest_usage
from public.profiles
where referral_code is not null and trim(referral_code) <> ''
group by referral_code
order by usage_count desc
limit 20;

-- =====================================================
-- 9) FIX SCRIPTS (jalankan jika diperlukan)
-- =====================================================

-- 9a) Insert seed data TPC-BOOT01 jika belum ada
/*
INSERT INTO public.profiles (
    id, 
    email, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'seed@tpcglobal.io',
    'TPC-BOOT01',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
*/

-- 9b) Update status menjadi ACTIVE jika ada tapi statusnya bukan ACTIVE
/*
UPDATE public.profiles 
SET status = 'ACTIVE', updated_at = NOW()
WHERE upper(trim(referral_code)) = 'TPC-BOOT01' 
AND status != 'ACTIVE';
*/

-- 9c) Function yang benar (recreate jika perlu)
/*
CREATE OR REPLACE FUNCTION validate_referral_code_public(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE UPPER(TRIM(referral_code)) = UPPER(TRIM(p_code))
        AND status = 'ACTIVE'
    ) INTO result;
    
    RETURN result;
END;
$$;
*/

-- 9d) Grant execute ke anon user (jika perlu)
/*
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public TO authenticated;
*/
