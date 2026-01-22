-- =========================================================
-- CRITICAL FIX: APP SETTINGS TABLE & RPC FUNCTION
-- Target: https://watoxiwtdnkpxdirkvvf.supabase.co
-- Purpose: Fix 404 errors for /rpc/get_app_settings and /app_settings
-- =========================================================

-- 1. Pastikan schema public
create schema if not exists public;

-- 2. Buat table app_settings
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Enable RLS
alter table public.app_settings enable row level security;

-- 4. Policy read publik
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'app_settings'
      and policyname = 'public_read'
  ) then
    create policy public_read
      on public.app_settings
      for select
      using (is_public = true);
  end if;
end $$;

-- 5. Insert default settings (aman kalau sudah ada)
insert into public.app_settings (key, value, is_public)
values
  ('site_name', '"TPC Global"', true),
  ('site_tagline', '"Trader Professional Community"', true)
on conflict (key) do nothing;

-- 6. RPC function get_app_settings
create or replace function public.get_app_settings()
returns jsonb
language sql
security definer
as $$
  select coalesce(
    jsonb_object_agg(key, value),
    '{}'::jsonb
  )
  from public.app_settings
  where is_public = true;
$$;

-- 7. Grant akses
grant execute on function public.get_app_settings() to anon, authenticated;
grant select on public.app_settings to anon, authenticated;

-- 8. VERIFICATION QUERIES
SELECT '=== VERIFICATION RESULTS ===' as step;

-- Check table exists
SELECT 
  'app_settings table' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check function exists
SELECT 
  'get_app_settings function' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check policy exists
SELECT 
  'public_read policy' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'public_read') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Test RPC function
DO $$
BEGIN
  DECLARE
    result JSONB;
  BEGIN
    SELECT public.get_app_settings() INTO result;
    RAISE NOTICE '✅ RPC Test SUCCESS: %', result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ RPC Test FAILED: %', SQLERRM;
  END;
END $$;

-- Test table access
DO $$
BEGIN
  DECLARE
    count_result INTEGER;
  BEGIN
    SELECT COUNT(*) INTO count_result FROM public.app_settings WHERE is_public = true;
    RAISE NOTICE '✅ Table Access SUCCESS: % rows found', count_result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Table Access FAILED: %', SQLERRM;
  END;
END $$;

SELECT '=== CRITICAL FIX COMPLETED ===' as step, now() as completed_at;
