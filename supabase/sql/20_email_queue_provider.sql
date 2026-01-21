-- =====================================================
-- EMAIL QUEUE PROVIDER MESSAGE ID COLUMN
-- =====================================================

-- Add provider_message_id column for tracking external email provider
alter table public.email_queue
add column if not exists provider_message_id text;

-- Index for provider filtering
create index if not exists email_queue_provider_idx
on public.email_queue (provider_message_id, status);

-- Update email queue monitoring view to include provider
drop view if exists public.email_queue_monitor;
create or replace view public.email_queue_monitor as
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
    q.lock_duration_minutes,
    q.health_status,
    q.provider_message_id
  from public.email_queue q
  order by q.created_at desc;

-- Grant read access to monitoring view
create policy "email_queue_monitor_read" on public.email_queue_monitor
for select to authenticated
using (true);

-- Update admin email queue details function to include provider
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
  locked_at timestamp,
  locked_by text,
  lock_duration_minutes int,
  health_status text,
  provider_message_id text
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
    q.lock_duration_minutes,
    q.health_status,
    q.provider_message_id
  from public.email_queue q
  order by q.created_at desc;
$$;

-- Update admin retry email function to include provider tracking
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

  -- Get email details before update
  select * into v_email_record
  from public.email_queue q
  where q.id = p_id;

  if not found then
    raise exception 'email not found';
  end if;

  -- Update email status and reset for retry
  update public.email_queue
  set status = 'PENDING',
      next_attempt_at = now(),
      attempt_count = 0,
      last_error = null,
      locked_at = null,
      locked_by = null,
      last_attempt_at = null,
      provider_message_id = 'RESEND_API'
  where id = p_id;

  -- Log admin action with provider tracking
  perform public.log_admin_action(
    'ADMIN_RETRY_EMAIL',
    v_email_record.to_email,
    jsonb_build_object(
      'email_id', p_id,
      'template', v_email_record.template,
      'variables', v_email_record.variables,
      'provider_message_id', v_email_record.provider_message_id,
      'retry_at', now()
    )
  );
end;
$$;

-- Update admin force send email function to include provider tracking
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

  -- Send immediately using provider (bypass queue)
  update public.email_queue
  set status = 'SENT',
      sent_at = now(),
      last_error = null,
      locked_at = null,
      locked_by = null,
      last_attempt_at = null,
      provider_message_id = 'RESEND_API',
      next_attempt_at = null,
      attempt_count = 0
  where id = p_id;

  -- Log admin action with provider tracking
  perform public.log_admin_action(
    'ADMIN_FORCE_SEND_EMAIL',
    v_email_record.to_email,
    jsonb_build_object(
      'email_id', p_id,
      'template', v_email_record.template,
      'variables', v_email_record.variables,
      'provider_message_id', v_email_record.provider_message_id,
      'forced_at', now()
    )
  );
end;
$$;

-- Update admin bulk retry emails function to include provider tracking
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

  -- Update emails for retry
  update public.email_queue
  set status = 'PENDING',
      next_attempt_at = now(),
      attempt_count = 0,
      last_error = null,
      locked_at = null,
      locked_by = null,
      last_attempt_at = null,
      provider_message_id = 'RESEND_API'
  where id = any(p_ids);
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Update admin bulk cancel emails function to include provider tracking
create or replace function public.admin_bulk_cancel_emails(p_ids bigint[])
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Update emails for cancellation
  update public.email_queue
  set status = 'CANCELLED'
  where id = any(p_ids);
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Update admin cleanup function to include provider tracking
create or replace function public.admin_cleanup_old_emails(p_days int default 30)
returns int
language plpgsql
security defier
set search_path = public
as $$
declare
  v_deleted int;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Log cleanup action with provider tracking
  perform public.log_admin_action(
    'ADMIN_CLEANUP_OLD_EMAILS',
    null,
    jsonb_build_object(
      'deleted_count', v_deleted,
      'provider_message_id', 'RESEND_API',
      'days', p_days,
      'cleanup_at', now()
    )
  );

  delete from public.email_queue
  where created_at < now() - make_interval(days => p_days);
  
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Helper function to get provider statistics
create or replace function public.admin_get_provider_stats()
returns table (
  provider text,
  count bigint,
  success_rate numeric,
  failure_rate numeric,
  avg_attempts numeric,
  stale_lock_count bigint,
  last_24h_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    coalesce(q.provider_message_id, 'UNKNOWN') as provider,
    count(*)::bigint,
    round(
      (count(*)::float * 100.0 / 
       sum(case when status = 'SENT' then 1.0 else 0 end) * 100.0, 2
    ) as success_rate,
    round(
      (count(*)::float * 100.0 / 
       sum(case when status = 'FAILED' then 1.0 else 0 end) * 100.0, 2
    ) as failure_rate,
    round(
      avg(case when attempt_count > 0 then attempt_count::float else 0 end) as avg_attempts,
      2
    ),
    count(*) filter (
      provider_message_id = 'RESEND_API' and 
      locked_at is not null and 
      locked_at > now() - interval '5 minutes'
    )::bigint as stale_lock_count,
    count(*) filter (
      last_attempt_at >= now() - interval '24 hours' and 
      status = 'FAILED'
    )::bigint as last_24h_count
  )
  from public.email_queue q
  order by created_at desc;
$$;

grant execute on function public.admin_get_provider_stats() to authenticated;
