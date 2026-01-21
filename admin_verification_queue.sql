-- ==========================================
-- T) ADMIN VERIFICATION QUEUE (SECURE RPC + RLS)
-- ==========================================

-- 1) Allow admins to read all verification requests
drop policy if exists "verification_requests_read_admin" on public.verification_requests;
create policy "verification_requests_read_admin"
on public.verification_requests
for select
to authenticated
using (public.is_admin(auth.uid()));

-- (keep existing read_own policy for users)

-- 2) RPC: admin decision (approve/reject)
create or replace function public.admin_decide_verification(
  p_request_id bigint,
  p_decision text,        -- 'APPROVE' or 'REJECT'
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v_decision text := upper(trim(coalesce(p_decision,'')));
  v_notes text := nullif(trim(coalesce(p_notes,'')), '');

  v_user uuid;
  v_wallet text;
  v_status text;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(actor) then
    raise exception 'Forbidden: admin only';
  end if;

  if v_decision not in ('APPROVE','REJECT') then
    return jsonb_build_object('ok', false, 'error', 'INVALID_DECISION');
  end if;

  -- Lock request row
  select user_id, wallet_address, status
    into v_user, v_wallet, v_status
  from public.verification_requests
  where id = p_request_id
  for update;

  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;

  if upper(v_status) <> 'REQUESTED' then
    return jsonb_build_object('ok', false, 'error', 'NOT_REQUESTED', 'status', v_status);
  end if;

  if v_decision = 'APPROVE' then
    update public.verification_requests
    set status = 'APPROVED',
        notes = v_notes
    where id = p_request_id;

    update public.profiles
    set verification_status = 'VERIFIED',
        verified = true,
        wallet_address = coalesce(wallet_address, v_wallet),
        updated_at = now()
    where id = v_user;

  else
    update public.verification_requests
    set status = 'REJECTED',
        notes = v_notes
    where id = p_request_id;

    update public.profiles
    set verification_status = 'REJECTED',
        updated_at = now()
    where id = v_user;
  end if;

  -- Audit log (if exists)
  begin
    insert into public.admin_audit_log(actor_id, action, target_id, payload)
    values (
      actor,
      case when v_decision='APPROVE' then 'APPROVE_VERIFICATION' else 'REJECT_VERIFICATION' end,
      v_user,
      jsonb_build_object(
        'request_id', p_request_id,
        'wallet', v_wallet,
        'notes', v_notes
      )
    );
  exception when others then
    null;
  end;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_decide_verification(bigint, text, text) to authenticated;
