-- =====================================================
-- VERIFICATION REJECT UPGRADE WITH NOTIFICATIONS
-- =====================================================

create or replace function public.admin_reject_verification(p_request_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  before_row jsonb;
  after_row jsonb;
  v_email text;
begin
  if not public.is_admin_level(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into req
  from public.verification_requests
  where id = p_request_id;

  if not found then
    raise exception 'request not found';
  end if;

  select to_jsonb(r) into before_row
  from public.verification_requests r
  where r.id = p_request_id;

  update public.verification_requests
  set status = 'REJECTED',
      rejection_reason = coalesce(p_reason, rejection_reason),
      updated_at = now()
  where id = p_request_id;

  select to_jsonb(r) into after_row
  from public.verification_requests r
  where r.id = p_request_id;

  -- ✅ notify user
  perform public.push_notification(
    req.user_id,
    'VERIFICATION_REJECTED',
    'Verification rejected',
    coalesce('Your verification was rejected. Reason: '||p_reason, 'Your verification was rejected. Please review and resubmit.'),
    jsonb_build_object('request_id', p_request_id, 'reason', p_reason)
  );

  select email into v_email from public.profiles where id = req.user_id;
  if v_email is not null and v_email <> '' then
    perform public.queue_email(
      v_email,
      'TPC Verification Rejected',
      'verification_rejected',
      jsonb_build_object('request_id', p_request_id, 'reason', p_reason)
    );
  end if;

  perform public.log_admin_action(
    'ADMIN_REJECT_VERIFICATION',
    req.user_id,
    jsonb_build_object('request_id', p_request_id, 'reason', p_reason, 'before', before_row, 'after', after_row)
  );
end;
$$;

grant execute on function public.admin_reject_verification(uuid, text) to authenticated;

-- =====================================================
-- UPGRADE admin_approve_verification WITH NOTIFICATIONS
-- =====================================================

create or replace function public.admin_approve_verification(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  req record;
  before_row jsonb;
  after_row jsonb;
  v_email text;
begin
  if not public.is_admin_level(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select * into req
  from public.verification_requests
  where id = p_request_id;

  if not found then
    raise exception 'request not found';
  end if;

  select to_jsonb(r) into before_row
  from public.verification_requests r
  where r.id = p_request_id;

  update public.verification_requests
  set status = 'APPROVED',
      updated_at = now()
  where id = p_request_id;

  -- Update user verification status
  update public.profiles
  set verification_status = 'VERIFIED',
      verification_request_id = null,
      updated_at = now()
  where id = req.user_id;

  select to_jsonb(r) into after_row
  from public.verification_requests r
  where r.id = p_request_id;

  -- ✅ notify user
  perform public.push_notification(
    req.user_id,
    'VERIFICATION_APPROVED',
    'Verification approved',
    'Your wallet verification has been approved successfully!',
    jsonb_build_object('request_id', p_request_id, 'wallet_address', req.wallet_address)
  );

  select email into v_email from public.profiles where id = req.user_id;
  if v_email is not null and v_email <> '' then
    perform public.queue_email(
      v_email,
      'TPC Verification Approved',
      'verification_approved',
      jsonb_build_object('request_id', p_request_id, 'wallet_address', req.wallet_address)
    );
  end if;

  perform public.log_admin_action(
    'ADMIN_APPROVE_VERIFICATION',
    req.user_id,
    jsonb_build_object('request_id', p_request_id, 'before', before_row, 'after', after_row)
  );
end;
$$;

grant execute on function public.admin_approve_verification(uuid) to authenticated;
