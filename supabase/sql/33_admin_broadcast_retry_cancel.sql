-- =====================================================
-- AF14+ (1) Retry Failed + (2) Cancel Broadcast
-- Admin-only RPC, safe & idempotent
-- =====================================================

begin;

-- Retry failed emails in a broadcast (set back to pending, clear error)
create or replace function public.admin_retry_failed_broadcast(p_broadcast_id uuid)
returns table(retried int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int := 0;
begin
  if v_uid is null or not public.is_admin(v_uid) then
    raise exception 'Admin only';
  end if;

  update public.email_queue
  set status = 'pending',
      last_error = null
  where broadcast_id = p_broadcast_id
    and status = 'failed';

  get diagnostics v_count = row_count;

  -- refresh persisted counts quickly
  update public.broadcasts b
  set failed_count = 0
  where b.id = p_broadcast_id;

  return query select v_count as retried;
end;
$$;

-- Cancel broadcast:
-- - mark broadcasts.status = cancelled
-- - set all pending/sending emails in queue to failed with reason "cancelled"
create or replace function public.admin_cancel_broadcast(p_broadcast_id uuid)
returns table(cancelled int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_count int := 0;
begin
  if v_uid is null or not public.is_admin(v_uid) then
    raise exception 'Admin only';
  end if;

  update public.broadcasts
  set status = 'cancelled'
  where id = p_broadcast_id;

  update public.email_queue
  set status = 'failed',
      last_error = coalesce(nullif(last_error,''),'cancelled by admin')
  where broadcast_id = p_broadcast_id
    and status in ('pending','sending');

  get diagnostics v_count = row_count;

  return query select v_cancelled as cancelled;
end;
$$;

commit;
