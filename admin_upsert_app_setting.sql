-- RPC to safely upsert app settings (SECURITY DEFINER)
-- Only admins can call this function
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

  -- Log the admin action before updating
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

grant execute on function public.admin_upsert_app_setting(text, jsonb) to authenticated;
