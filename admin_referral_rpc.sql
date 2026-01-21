create or replace function public.admin_toggle_referral_code(
  p_code text,
  p_is_active boolean,
  p_action text default 'TOGGLE_REFERRAL_CODE'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role text;
  exists_code boolean;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(actor) then
    raise exception 'Forbidden: admin only';
  end if;

  select lower(coalesce(role,'member')) into actor_role
  from public.profiles where id = actor;

  select exists(select 1 from public.referral_codes where code = p_code) into exists_code;
  if not exists_code then
    raise exception 'Referral code not found';
  end if;

  update public.referral_codes
  set is_active = p_is_active
  where code = p_code;

  insert into public.admin_audit_log(actor_id, action, target_id, payload)
  values (
    actor,
    coalesce(p_action, 'TOGGLE_REFERRAL_CODE'),
    null,
    jsonb_build_object(
      'code', p_code,
      'is_active', p_is_active,
      'actor_role', actor_role
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_toggle_referral_code(text, boolean, text) to authenticated;
