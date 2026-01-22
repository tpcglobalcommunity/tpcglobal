-- =========================================================
-- AG3 FINAL SQL - COPY-PASTE KE SUPABASE SQL EDITOR
-- Project: https://watoxiwtdnkpxdirkvvf.supabase.co
-- =========================================================

-- 0) Pastikan extension untuk gen_random_uuid (kalau belum)
create extension if not exists pgcrypto;

-- 1) Table app_settings (idempotent)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Kalau table sudah ada tapi kolom belum ada
alter table public.app_settings
  add column if not exists value jsonb not null default '{}'::jsonb;

alter table public.app_settings
  add column if not exists is_public boolean not null default true;

alter table public.app_settings
  add column if not exists created_at timestamptz not null default now();

alter table public.app_settings
  add column if not exists updated_at timestamptz not null default now();

-- 3) updated_at trigger (optional tapi bagus)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- 4) RPC: get_app_settings (INI YANG HARUS ADA AGAR 404 HILANG)
create or replace function public.get_app_settings()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(s.key, s.value), '{}'::jsonb)
  from public.app_settings s
  where s.is_public = true;
$$;

grant execute on function public.get_app_settings() to anon, authenticated;

-- 5) RLS aman
alter table public.app_settings enable row level security;

-- hapus policy lama kalau ada (biar tidak konflik)
drop policy if exists "app_settings_select_public" on public.app_settings;

create policy "app_settings_select_public"
on public.app_settings
for select
to anon, authenticated
using (is_public = true);

-- 6) Seed minimal (biar test kelihatan)
insert into public.app_settings (key, value, is_public)
values
  ('site_name', '"TPC Global"'::jsonb, true),
  ('telegram_url', '"https://t.me/tpcglobalcommunity"'::jsonb, true)
on conflict (key) do update set
  value = excluded.value,
  is_public = excluded.is_public;

-- 7) VERIFICATION QUERIES
SELECT '=== VERIFICATION ===' as step;

-- Test get_app_settings function
DO $$
BEGIN
    DECLARE
        result JSONB;
    BEGIN
        SELECT public.get_app_settings() INTO result;
        RAISE NOTICE '✅ get_app_settings test SUCCESS: %', result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_app_settings test FAILED: %', SQLERRM;
    END;
END $$;

-- Check if function exists
SELECT 
    'get_app_settings function' as object,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if table exists
SELECT 
    'app_settings table' as object,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check if is_public column exists
SELECT 
    'is_public column' as object,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND table_schema = 'public' AND column_name = 'is_public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT '=== AG3 FINAL SQL COMPLETED ===' as step, now() as completed_at;
