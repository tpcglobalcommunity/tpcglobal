-- =====================================================
-- MEMBER UPDATE UPGRADE WITH NOTIFICATIONS
-- =====================================================

create or replace function public.admin_update_member(
  p_user_id uuid,
  p_status text default null,
  p_role text default null,
  p_verified boolean default null,
  p_can_invite boolean default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  before_row jsonb;
  after_row jsonb;
  v_email text;
  v_changes text[];
  v_change_count int := 0;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select to_jsonb(p) into before_row
  from public.profiles p
  where p.id = p_user_id;

  if before_row is null then
    raise exception 'profile not found';
  end if;

  -- Track changes for notification
  if p_status is not null and (before_row->>'status') is distinct from p_status then
    v_changes := array_append(v_changes, 'status: ' || coalesce(before_row->>'status', 'null') || ' → ' || p_status);
    v_change_count := v_change_count + 1;
  end if;

  if p_role is not null and (before_row->>'role') is distinct from p_role then
    v_changes := array_append(v_changes, 'role: ' || coalesce(before_row->>'role', 'null') || ' → ' || p_role);
    v_change_count := v_change_count + 1;
  end if;

  if p_verified is not null and ((before_row->>'verified')::boolean) is distinct from p_verified then
    v_changes := array_append(v_changes, 'verified: ' || coalesce(before_row->>'verified', 'null') || ' → ' || p_verified::text);
    v_change_count := v_change_count + 1;
  end if;

  if p_can_invite is not null and ((before_row->>'can_invite')::boolean) is distinct from p_can_invite then
    v_changes := array_append(v_changes, 'can_invite: ' || coalesce(before_row->>'can_invite', 'null') || ' → ' || p_can_invite::text);
    v_change_count := v_change_count + 1;
  end if;

  update public.profiles
  set
    status = coalesce(p_status, status),
    role = coalesce(p_role, role),
    verified = coalesce(p_verified, verified),
    can_invite = coalesce(p_can_invite, can_invite),
    updated_at = now()
  where id = p_user_id;

  select to_jsonb(p) into after_row
  from public.profiles p
  where p.id = p_user_id;

  -- ✅ Send notification if changes were made
  if v_change_count > 0 then
    perform public.push_notification(
      p_user_id,
      'ACCOUNT_UPDATED',
      'Account updated',
      'Your account settings have been updated by administrator. Changes: ' || array_to_string(v_changes, ', '),
      jsonb_build_object(
        'before', before_row,
        'after', after_row,
        'changes', v_changes,
        'change_count', v_change_count
      )
    );

    -- ✅ Send email notification
    select email into v_email from public.profiles where id = p_user_id;
    if v_email is not null and v_email <> '' then
      perform public.queue_email(
        v_email,
        'TPC Account Updated',
        'account_updated',
        jsonb_build_object(
          'changes', v_changes,
          'change_count', v_change_count,
          'updated_by', 'administrator',
          'updated_at', now()
        )
      );
    end if;
  end if;

  -- ✅ Log admin action with complete audit trail
  perform public.log_admin_action(
    'ADMIN_UPDATE_MEMBER',
    p_user_id,
    jsonb_build_object(
      'before', before_row,
      'after', after_row,
      'changes', v_changes,
      'change_count', v_change_count
    )
  );
end;
$$;

grant execute on function public.admin_update_member(uuid, text, text, boolean, boolean) to authenticated;

-- =====================================================
-- HELPER: GET MEMBER CHANGES SUMMARY
-- =====================================================

create or replace function public.admin_get_member_changes_summary(p_user_id uuid)
returns table (
  field text,
  before_value text,
  after_value text,
  changed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  -- This would typically query an audit log table for change history
  -- For now, return current state as placeholder
  select 
    'status' as field,
    p.status::text as before_value,
    p.status::text as after_value,
    p.updated_at as changed_at
  from public.profiles p
  where p.id = p_user_id
  union all
  select 
    'role' as field,
    p.role::text as before_value,
    p.role::text as after_value,
    p.updated_at as changed_at
  from public.profiles p
  where p.id = p_user_id
  union all
  select 
    'verified' as field,
    p.verified::text as before_value,
    p.verified::text as after_value,
    p.updated_at as changed_at
  from public.profiles p
  where p.id = p_user_id
  union all
  select 
    'can_invite' as field,
    p.can_invite::text as before_value,
    p.can_invite::text as after_value,
    p.updated_at as changed_at
  from public.profiles p
  where p.id = p_user_id;
$$;

grant execute on function public.admin_get_member_changes_summary(uuid) to authenticated;
