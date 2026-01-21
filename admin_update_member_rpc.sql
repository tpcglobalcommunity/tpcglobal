-- ==========================================
-- V) ADMIN UPDATE MEMBER (SECURE RPC + AUDIT)
-- ==========================================

create or replace function public.admin_update_member(
  p_user_id uuid,
  p_status text default null,                -- ACTIVE/PENDING/BANNED
  p_role text default null,                  -- member/admin/super_admin
  p_verified boolean default null,           -- true/false
  p_verification_status text default null,   -- NONE/REQUESTED/VERIFIED/REJECTED
  p_notes text default null                  -- audit notes
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v_status text := nullif(upper(trim(coalesce(p_status,''))), '');
  v_role text := nullif(lower(trim(coalesce(p_role,''))), '');
  v_vstatus text := nullif(upper(trim(coalesce(p_verification_status,''))), '');
  v_notes text := nullif(trim(coalesce(p_notes,'')), '');

  old_row jsonb;
  new_row jsonb;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(actor) then
    raise exception 'Forbidden: admin only';
  end if;

  if p_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'MISSING_USER');
  end if;

  -- Validate enums if provided
  if v_status is not null and v_status not in ('ACTIVE','PENDING','BANNED') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_STATUS');
  end if;

  if v_role is not null and v_role not in ('member','admin','super_admin') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_ROLE');
  end if;

  if v_vstatus is not null and v_vstatus not in ('NONE','REQUESTED','VERIFIED','REJECTED') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_VERIFICATION_STATUS');
  end if;

  -- Load old row snapshot
  select to_jsonb(p.*) into old_row
  from public.profiles p
  where p.id = p_user_id;

  if old_row is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  -- Apply updates (only if value provided)
  update public.profiles
  set
    status = coalesce(v_status, status),
    role = coalesce(v_role, role),
    verified = coalesce(p_verified, verified),
    verification_status = coalesce(v_vstatus, verification_status),
    updated_at = now()
  where id = p_user_id;

  select to_jsonb(p.*) into new_row
  from public.profiles p
  where p.id = p_user_id;

  -- Audit log if table exists
  begin
    insert into public.admin_audit_log(actor_id, action, target_id, payload)
    values (
      actor,
      'ADMIN_UPDATE_MEMBER',
      p_user_id,
      jsonb_build_object(
        'notes', v_notes,
        'before', old_row,
        'after', new_row
      )
    );
  exception when others then
    null;
  end;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_update_member(uuid, text, text, boolean, text, text) to authenticated;
