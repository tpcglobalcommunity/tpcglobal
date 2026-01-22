-- MINIMAL APP SETTINGS FIX - UNTUK SIGNUP PAGE
-- Safe, idempotent, minimal changes

-- 1) Table minimal
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) updated_at trigger (opsional, minimal & aman)
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_app_settings_updated_at'
  ) then
    create or replace function public.set_updated_at()
    returns trigger
    language plpgsql
    as $f$
    begin
      new.updated_at = now();
      return new;
    end
    $f$;

    create trigger trg_app_settings_updated_at
    before update on public.app_settings
    for each row
    execute function public.set_updated_at();
  end if;
end$$;

-- 3) Seed minimal agar app punya default
insert into public.app_settings (key, value, is_public)
values
  ('signup_enabled', jsonb_build_object('enabled', true), true),
  ('referral_required', jsonb_build_object('required', true), true),
  ('maintenance_mode', jsonb_build_object('enabled', false), true)
on conflict (key) do nothing;

-- 4) RLS (aman untuk public read yang is_public=true)
alter table public.app_settings enable row level security;

-- 5) Hapus policy lama jika ada (biar idempotent)
drop policy if exists "public read app_settings" on public.app_settings;

create policy "public read app_settings"
on public.app_settings
for select
to anon, authenticated
using (is_public = true);

-- 6) Tidak izinkan insert/update/delete dari anon/authenticated by default
-- (admin only via service role / dashboard)
revoke all on table public.app_settings from anon, authenticated;

-- 7) Tapi tetap boleh SELECT via policy (PostgREST butuh grant SELECT)
grant select on table public.app_settings to anon, authenticated;

-- 8) RPC function: get_app_settings
create or replace function public.get_app_settings()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_object_agg(key, value),
    '{}'::jsonb
  )
  from public.app_settings
  where is_public = true;
$$;

grant execute on function public.get_app_settings() to anon;
grant execute on function public.get_app_settings() to authenticated;

-- 9) Verification queries
SELECT '=== MINIMAL APP SETTINGS FIX COMPLETED ===' as step;
SELECT 'app_settings table' as object, CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
SELECT 'get_app_settings function' as object, CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
SELECT 'public read policy' as object, CASE WHEN EXISTS(SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'public read app_settings') THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

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

SELECT '=== MINIMAL FIX COMPLETE ===' as step, now() as completed_at;
