-- =====================================================
-- ADMIN RPC FUNCTIONS (MEMBER MANAGEMENT + VERIFICATION)
-- =====================================================

-- 1. RPC Function: Admin Update Member
create or replace function public.admin_update_member(
  p_user_id uuid,
  p_status text default null,
  p_role text default null,
  p_verified boolean default null,
  p_can_invite boolean default null
)
returns table (
  success boolean,
  error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  result record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Log admin action
  perform public.log_admin_action(
    'ADMIN_UPDATE_MEMBER',
    p_user_id,
    jsonb_build_object(
      'status', p_status,
      'role', p_role,
      'verified', p_verified,
      'can_invite', p_can_invite,
      'updated_at', now()
    )
  );

  -- Update member with validation
  update public.profiles set
    status = coalesce(p_status, status),
    role = coalesce(p_role, role),
    verified = coalesce(p_verified, verified),
    can_invite = coalesce(p_can_invite, can_invite),
    updated_at = now()
  where id = p_user_id;

  return query select 
    true as success,
    null as error;
end;
$$;

-- 2. RPC Function: Admin Approve Verification
create or replace function public.admin_approve_verification(
  p_request_id bigint
)
returns table (
  success boolean,
  error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  result record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Get verification request details
  declare v_user_id uuid;
  declare v_wallet_address text;
  
  select user_id, wallet_address into v_user_id, v_wallet_address
  from public.verification_requests
  where id = p_request_id;

  -- Log admin action
  perform public.log_admin_action(
    'ADMIN_APPROVE_VERIFICATION',
    v_user_id,
    jsonb_build_object(
      'request_id', p_request_id,
      'wallet_address', v_wallet_address,
      'approved_at', now()
    )
  );

  -- Update verification request
  update public.verification_requests set
    status = 'APPROVED',
    reviewed_at = now(),
    reviewed_by = auth.uid()
  where id = p_request_id;

  -- Update member verification status
  update public.profiles set
    verified = true,
    verification_status = 'VERIFIED',
    updated_at = now()
  where id = v_user_id;

  return query select 
    true as success,
    null as error;
end;
$$;

-- 3. RPC Function: Admin Reject Verification
create or replace function public.admin_reject_verification(
  p_request_id bigint,
  p_reason text default null
)
returns table (
  success boolean,
  error text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  result record;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Get verification request details
  declare v_user_id uuid;
  declare v_wallet_address text;
  
  select user_id, wallet_address into v_user_id, v_wallet_address
  from public.verification_requests
  where id = p_request_id;

  -- Log admin action
  perform public.log_admin_action(
    'ADMIN_REJECT_VERIFICATION',
    v_user_id,
    jsonb_build_object(
      'request_id', p_request_id,
      'wallet_address', v_wallet_address,
      'reason', p_reason,
      'rejected_at', now()
    )
  );

  -- Update verification request
  update public.verification_requests set
    status = 'REJECTED',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    notes = p_reason
  where id = p_request_id;

  -- Update member verification status
  update public.profiles set
    verification_status = 'REJECTED',
    updated_at = now()
  where id = v_user_id;

  return query select 
    true as success,
    null as error;
end;
$$;

-- 4. Grant permissions
grant execute on function public.admin_update_member to authenticated;
grant execute on function public.admin_approve_verification to authenticated;
grant execute on function public.admin_reject_verification to authenticated;
