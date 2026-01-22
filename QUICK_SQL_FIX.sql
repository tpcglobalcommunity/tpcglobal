-- QUICK SQL FIX - UNTUK ERROR 404
-- Jalankan ini di Supabase SQL Editor

-- 1) Create table (idempotent)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS
alter table public.app_settings enable row level security;

-- 3) Create policy (idempotent)
drop policy if exists "app_settings_public_read" on public.app_settings;
create policy "app_settings_public_read"
on public.app_settings
for select
to anon, authenticated
using (is_public = true);

-- 4) Create RPC function (idempotent)
create or replace function public.get_app_settings()
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.app_settings
  where is_public = true;
$$;

-- 5) Grant permissions
grant execute on function public.get_app_settings() to anon, authenticated;
grant select on table public.app_settings to anon, authenticated;

-- 6) Insert minimal data (idempotent)
insert into public.app_settings (key, value, is_public)
values
  ('signup_enabled', '{"enabled": true}'::jsonb, true),
  ('referral_required', '{"required": true}'::jsonb, true),
  ('maintenance_mode', '{"enabled": false}'::jsonb, true)
on conflict (key) do nothing;

-- 7) Verification
SELECT '=== QUICK FIX COMPLETED ===' as step;
SELECT 'app_settings table' as object, CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
SELECT 'get_app_settings function' as object, CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
SELECT 'app_settings_public_read policy' as object, CASE WHEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'app_settings_public_read') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- 8) Test RPC
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

SELECT '=== READY FOR TESTING ===' as step, now() as completed_at;
