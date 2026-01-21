-- =====================================================
-- SERVICE-ONLY BROADCAST SCHEDULER
-- Enqueue scheduled broadcasts whose time has arrived
-- =====================================================

begin;

-- Service-only scheduler: enqueue scheduled broadcasts whose time has arrived
create or replace function public.service_run_broadcast_scheduler(p_limit_broadcasts int default 5)
returns table(processed int, total_enqueued int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_processed int := 0;
  v_total int := 0;
  r record;
  x record;
begin
  for r in
    select id
    from public.broadcasts
    where status = 'scheduled'
      and scheduled_at is not null
      and scheduled_at <= now()
    order by scheduled_at asc
    limit greatest(1, coalesce(p_limit_broadcasts, 5))
  loop
    v_processed := v_processed + 1;

    -- Enqueue recipients into email_queue (reuse existing enqueue function)
    select * into x from public.admin_enqueue_broadcast(r.id, null);
    v_total := v_total + coalesce(x.enqueued, 0);
  end loop;

  return query select v_processed, v_total;
end;
$$;

-- SECURITY: restrict execute
revoke all on function public.service_run_broadcast_scheduler(int) from public;
revoke all on function public.service_run_broadcast_scheduler(int) from anon;
revoke all on function public.service_run_broadcast_scheduler(int) from authenticated;

-- Grant only to service_role (Supabase internal role)
grant execute on function public.service_run_broadcast_scheduler(int) to service_role;

commit;
