-- =====================================================
-- ADMIN SETTINGS UPGRADE - SUPER ADMIN ONLY
-- =====================================================

-- Upgrade admin_upsert_app_setting to require super admin
create or replace function public.admin_upsert_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  before_val jsonb;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select value into before_val
  from public.app_settings
  where key = p_key;

  insert into public.app_settings(key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();

  perform public.log_admin_action(
    'ADMIN_UPDATE_SETTING',
    auth.uid(),
    jsonb_build_object('key', p_key, 'before', before_val, 'after', p_value)
  );
end;
$$;

grant execute on function public.admin_upsert_app_setting(text, jsonb) to authenticated;

-- =====================================================
-- CREATE ADMIN_GET_APP_SETTING HELPER
-- =====================================================

-- Helper function to get app settings (viewer+ access)
create or replace function public.admin_get_app_setting(p_key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select value
  from public.app_settings
  where key = p_key;
$$;

grant execute on function public.admin_get_app_setting(text) to authenticated;

-- =====================================================
-- CREATE ADMIN_LIST_APP_SETTINGS HELPER
-- =====================================================

-- Helper function to list all app settings (viewer+ access)
create or replace function public.admin_list_app_settings()
returns table (
  key text,
  value jsonb,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select key, value, updated_at
  from public.app_settings
  order by key;
$$;

grant execute on function public.admin_list_app_settings() to authenticated;
