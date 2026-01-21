-- =====================================================
-- ADMIN RPC FUNCTIONS WITH RATE LIMITING
-- =====================================================

-- Upgrade admin_approve_verification with rate limiting
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
  -- Enforce rate limit: 5 approvals per minute
  perform public.enforce_admin_rate_limit('ADMIN_APPROVE_VERIFICATION', 5, 60);

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
  set status = 'APPROVED', updated_at = now()
  where id = p_request_id;

  update public.profiles
  set verified = true,
      status = 'ACTIVE',
      updated_at = now()
  where id = req.user_id;

  select to_jsonb(r) into after_row
  from public.verification_requests r
  where r.id = p_request_id;

  perform public.push_notification(
    req.user_id,
    'VERIFICATION_APPROVED',
    'Verification approved',
    'Your account verification has been approved. You can now access all member features.',
    jsonb_build_object('request_id', p_request_id)
  );

  select email into v_email from public.profiles where id = req.user_id;
  if v_email is not null and v_email <> '' then
    perform public.queue_email(
      v_email,
      'TPC Verification Approved',
      'verification_approved',
      jsonb_build_object('request_id', p_request_id)
    );
  end if;

  perform public.log_admin_action(
    'ADMIN_APPROVE_VERIFICATION',
    req.user_id,
    jsonb_build_object('request_id', p_request_id, 'before', before_row, 'after', after_row)
  );
end;
$$;

-- Upgrade admin_reject_verification with rate limiting
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
  -- Enforce rate limit: 5 rejections per minute
  perform public.enforce_admin_rate_limit('ADMIN_REJECT_VERIFICATION', 5, 60);

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

-- Upgrade admin_update_member with rate limiting
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
  -- Enforce rate limit: 10 updates per minute
  perform public.enforce_admin_rate_limit('ADMIN_UPDATE_MEMBER', 10, 60);

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

  -- Send notification if changes were made
  if v_change_count > 0 then
    perform public.push_notification(
      p_user_id,
      'ACCOUNT_UPDATED',
      'Account updated',
      'Your account settings have been updated by administrator. Changes: ' || array_to_string(v_changes, ', '),
      jsonb_build_object('before', before_row, 'after', after_row, 'changes', v_changes, 'change_count', v_change_count)
    );

    -- Send email notification
    select email into v_email from public.profiles where id = p_user_id;
    if v_email is not null and v_email <> '' then
      perform public.queue_email(
        v_email,
        'TPC Account Updated',
        'account_updated',
        jsonb_build_object('changes', v_changes, 'change_count', v_change_count, 'updated_by', 'administrator', 'updated_at', now())
      );
    end if;
  end if;

  -- Log admin action with complete audit trail
  perform public.log_admin_action(
    'ADMIN_UPDATE_MEMBER',
    p_user_id,
    jsonb_build_object('before', before_row, 'after', after_row, 'changes', v_changes, 'change_count', v_change_count)
  );
end;
$$;

-- Upgrade admin_upsert_app_setting with rate limiting
create or replace function public.admin_upsert_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Enforce rate limit: 20 setting updates per minute
  perform public.enforce_admin_rate_limit('ADMIN_UPSERT_APP_SETTING', 20, 60);

  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  perform public.log_admin_action('ADMIN_UPDATE_APP_SETTING', null, jsonb_build_object('key', p_key, 'value', p_value, 'updated_at', now()));
  
  insert into public.app_settings(key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;
