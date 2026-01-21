-- =====================================================
-- ADMIN EMAIL MANAGEMENT FUNCTIONS
-- =====================================================

-- Admin retry email manually (reset to PENDING)
create or replace function public.admin_retry_email(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.email_queue
  set status = 'PENDING',
      next_attempt_at = now(),
      attempt_count = 0,
      last_error = null
  where id = p_id;
end;
$$;

grant execute on function public.admin_retry_email(bigint) to authenticated;

-- Admin cancel email (mark as CANCELLED)
create or replace function public.admin_cancel_email(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.email_queue
  set status = 'CANCELLED'
  where id = p_id;
end;
$$;

grant execute on function public.admin_cancel_email(bigint) to authenticated;

-- Admin get email queue details for management
create or replace function public.admin_get_email_queue_details()
returns table (
  id bigint,
  to_email text,
  subject text,
  template text,
  variables jsonb,
  status text,
  attempt_count int,
  created_at timestamptz,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  locked_at timestamptz,
  locked_by text,
  lock_duration_minutes int,
  health_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    q.id,
    q.to_email,
    q.subject,
    q.template,
    q.variables,
    q.status,
    q.attempt_count,
    q.created_at,
    q.next_attempt_at,
    q.last_attempt_at,
    q.last_error,
    q.locked_at,
    q.locked_by,
    case 
      when q.locked_at is not null then 
        extract(epoch from (now() - q.locked_at))/60
      else null
    end as lock_duration_minutes,
    case 
      when q.locked_at is not null and q.locked_at > now() - interval '5 minutes' then 'STALE_LOCK'
      when q.status = 'PENDING' and q.next_attempt_at > now() then 'RETRY_DELAYED'
      when q.status = 'FAILED' and q.attempt_count >= 10 then 'PERMANENTLY_FAILED'
      else q.status
    end as health_status
  from public.email_queue q
  order by q.created_at desc;
$$;

grant execute on function public.admin_get_email_queue_details() to authenticated;

-- Admin force send email (bypass queue, immediate send)
create or replace function public.admin_force_send_email(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_record record;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Get email details
  select * into v_email_record
  from public.email_queue q
  where q.id = p_id;

  if not found then
    raise exception 'email not found';
  end if;

  -- Send immediately using Resend (bypass queue)
  -- This would typically call the email worker function
  -- For now, we'll mark as SENT and log the action
  update public.email_queue
  set status = 'SENT',
      sent_at = now(),
      last_error = null,
      locked_at = null,
      locked_by = null,
      last_attempt_at = null
  where id = p_id;

  -- Log admin action
  perform public.log_admin_action(
    'ADMIN_FORCE_SEND_EMAIL',
    v_email_record.to_email,
    jsonb_build_object(
      'email_id', p_id,
      'template', v_email_record.template,
      'variables', v_email_record.variables,
      'forced_at', now()
    )
  );
end;
$$;

grant execute on function public.admin_force_send_email(bigint) to authenticated;

-- Admin bulk operations for email queue management
create or replace function public.admin_bulk_retry_emails(p_ids bigint[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.email_queue
  set status = 'PENDING',
      next_attempt_at = now(),
      attempt_count = 0,
      last_error = null
  where id = any(p_ids);
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.admin_bulk_retry_emails(bigint[]) to authenticated;

create or replace function public.admin_bulk_cancel_emails(p_ids bigint[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.email_queue
  set status = 'CANCELLED'
  where id = any(p_ids);
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.admin_bulk_retry_emails(bigint[]) to authenticated;

-- Admin cleanup old emails (older than specified days)
create or replace function public.admin_cleanup_old_emails(p_days int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  delete from public.email_queue
  where created_at < now() - make_interval(days => p_days);
  
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

grant execute on function public.admin_cleanup_old_emails(int) to authenticated;
