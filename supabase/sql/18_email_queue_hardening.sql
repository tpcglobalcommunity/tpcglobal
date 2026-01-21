-- =====================================================
-- EMAIL QUEUE HARDENING: RETRIES + LOCKING + CLAIM BATCH
-- =====================================================

-- Add retry tracking and locking columns
alter table public.email_queue
add column if not exists attempt_count int not null default 0,
add column if not exists last_attempt_at timestamptz,
add column if not exists next_attempt_at timestamptz not null default now(),
add column if not exists locked_at timestamptz,
add column if not exists locked_by text;

-- Index for efficient batch claiming
create index if not exists email_queue_next_attempt_idx
on public.email_queue (status, next_attempt_at);

-- =====================================================
-- WORKER BATCH CLAIMING FUNCTION
-- =====================================================

-- Claim a batch of emails safely (for workers)
create or replace function public.worker_claim_email_batch(
  p_limit int default 25,
  p_lock_minutes int default 5
) returns table (
  id bigint,
  to_email text,
  subject text,
  template text,
  variables jsonb,
  attempt_count int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_lock_until timestamptz := v_now - make_interval(mins => p_lock_minutes);
begin
  -- Pick rows that are PENDING and due, and not locked (or lock expired), lock them, return them.
  return query
  with picked as (
    select q.id
    from public.email_queue q
    where q.status = 'PENDING'
      and q.next_attempt_at <= v_now
      and (q.locked_at is null or q.locked_at < v_lock_until)
    order by q.created_at asc
    limit greatest(1, least(p_limit, 100))
    for update skip locked
  ),
  locked as (
    update public.email_queue q
    set locked_at = v_now,
        locked_by = coalesce(current_setting('request.headers', true), 'worker')
    where q.id in (select id from picked)
    returning q.id, q.to_email, q.subject, q.template, q.variables, q.attempt_count
  )
  select * from locked;
end;
$$;

grant execute on function public.worker_claim_email_batch(int, int) to authenticated;

-- =====================================================
-- EMAIL STATUS UPDATE FUNCTIONS
-- =====================================================

-- Mark email as sent successfully
create or replace function public.worker_mark_email_sent(p_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.email_queue
  set status = 'SENT',
      sent_at = now(),
      last_error = null,
      locked_at = null,
      locked_by = null,
      last_attempt_at = null
  where id = p_id;
end;
$$;

grant execute on function public.worker_mark_email_sent(bigint) to authenticated;

-- Mark email as failed with exponential backoff (min 1m, max 60m)
create or replace function public.worker_mark_email_failed(p_id bigint, p_error text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt int;
  v_delay_minutes int;
begin
  update public.email_queue
  set attempt_count = attempt_count + 1,
      last_attempt_at = now(),
      last_error = left(coalesce(p_error,'unknown error'), 5000),
      locked_at = null,
      locked_by = null
  where id = p_id
  returning attempt_count into v_attempt;

  -- exponential backoff: 1,2,4,8,16,32,60...
  v_delay_minutes := least(60, greatest(1, (2 ^ least(10, v_attempt - 1))::int));

  update public.email_queue
  set next_attempt_at = now() + make_interval(mins => v_delay_minutes)
  where id = p_id;

  -- optional: give up after 10 attempts
  if v_attempt >= 10 then
    update public.email_queue
    set status = 'FAILED'
    where id = p_id;
  end if;
end;
$$;

grant execute on function public.worker_mark_email_failed(bigint, text) to authenticated;

-- =====================================================
-- WORKER HELPER FUNCTIONS
-- =====================================================

-- Get queue statistics for monitoring
create or replace function public.worker_get_queue_stats()
returns table (
  status text,
  count bigint,
  oldest_pending timestamptz,
  locked_count bigint,
  failed_24h bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    'TOTAL_PENDING' as status,
    count(*)::bigint,
    min(created_at) as oldest_pending,
    0::bigint as locked_count,
    0::bigint as failed_24h
  from public.email_queue
  where status = 'PENDING'
  
  union all
  
  select 
    'TOTAL_LOCKED' as status,
    0::bigint as count,
    null as oldest_pending,
    count(*)::bigint as locked_count,
    0::bigint as failed_24h
  from public.email_queue
  where locked_at is not null
  
  union all
  
  select 
    'FAILED_24H' as status,
    0::bigint as count,
    null as oldest_pending,
    0::bigint as locked_count,
    count(*)::bigint as failed_24h
  from public.email_queue
  where status = 'FAILED' 
    and last_attempt_at >= now() - interval '24 hours';
$$;

grant execute on function public.worker_get_queue_stats() to authenticated;

-- Cleanup old failed emails (older than 7 days)
create or replace function public.worker_cleanup_old_emails()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.email_queue
  where status = 'FAILED' 
    and last_attempt_at < now() - interval '7 days';
  
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

grant execute on function public.worker_cleanup_old_emails() to authenticated;

-- =====================================================
-- EMAIL QUEUE MONITORING VIEW
-- =====================================================

-- Create view for monitoring email queue health
create or replace view public.email_queue_monitor as
select 
  q.id,
  q.status,
  q.to_email,
  q.subject,
  q.template,
  q.created_at,
  q.next_attempt_at,
  q.attempt_count,
  q.last_error,
  q.locked_at,
  q.locked_by,
  case 
    when q.locked_at is not null and q.locked_at > now() - interval '5 minutes' then 'STALE_LOCK'
    when q.status = 'PENDING' and q.next_attempt_at > now() then 'RETRY_DELAYED'
    when q.status = 'FAILED' and q.attempt_count >= 10 then 'PERMANENTLY_FAILED'
    else q.status
  end as health_status,
  case 
    when q.locked_at is not null then now() - q.locked_at
    else null
  end as lock_duration
from public.email_queue q;

-- Grant read access to monitoring view
create policy "email_queue_monitor_read" on public.email_queue_monitor
for select to authenticated
using (true);
