-- =====================================================
-- APP SETTINGS TABLE + SEED + RPC FUNCTIONS
-- =====================================================

-- 1. Create app_settings table
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

-- 2. Seed initial settings
insert into public.app_settings (key, value, created_at, updated_at) values
  ('app_name', '"TPC Global"', now(), now()),
  ('app_version', '"1.0.0"', now(), now()),
  ('maintenance_mode', 'false', now(), now()),
  ('registration_enabled', 'true', now(), now()),
  ('verification_enabled', 'true', now(), now()),
  ('max_upload_size_mb', '10', now(), now()),
  ('supported_languages', '["en","id"]', now(), now()),
  ('default_language', '"en"', now(), now()),
  ('telegram_community', '"https://t.me/tpcglobalcommunity"', now(), now()),
  ('global_banner_enabled', 'false', now(), now()),
  ('global_banner_text', '""', now(), now()),
  ('maintenance_message', '"System maintenance in progress. Please check back later."', now(), now());

-- 3. Enable RLS on app_settings
alter table public.app_settings enable row level security;

-- 4. RLS Policies for app_settings
-- Anonymous users can read specific settings (for banner/maintenance)
create policy "app_settings_read_anon" on public.app_settings
  for select
  to anon
  using (key in ('maintenance_mode', 'global_banner_enabled', 'global_banner_text', 'maintenance_message'));

-- Authenticated users can read all settings
create policy "app_settings_read_auth" on public.app_settings
  for select
  to authenticated
  using (true);

-- Only admins can update settings
create policy "app_settings_write_admin" on public.app_settings
  for all
  to authenticated
  using (public.is_admin(auth.uid()));

-- 5. RPC Function: Get App Settings
create or replace function public.get_app_settings()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_object_agg(key || 'value') into result
  from (
    select 
      key, 
      value
    from public.app_settings
  );
  return coalesce(result, '{}'::jsonb);
end;
$$;

-- 6. RPC Function: Admin Upsert App Setting
create or replace function public.admin_upsert_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Log admin action before updating
  perform public.log_admin_action(
    'ADMIN_UPDATE_APP_SETTING',
    null,
    jsonb_build_object(
      'key', p_key,
      'value', p_value,
      'updated_at', now()
    )
  );

  insert into public.app_settings(key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();
end;
$$;

-- 7. Grant permissions
grant execute on function public.get_app_settings to authenticated;
grant execute on function public.get_app_settings to anon;
grant execute on function public.admin_upsert_app_setting to authenticated;
