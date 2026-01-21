-- =====================================================
-- ADMIN SEARCH AUDIT LOGS RPC FUNCTION
-- =====================================================

-- Advanced search function for admin audit log management
create or replace function public.admin_search_audit_logs(
  p_q text default null,
  p_action text default null,
  p_limit int default 20,
  p_offset int default 0
) returns table (
  total_count bigint,
  id bigint,
  created_at timestamptz,
  action text,
  actor_id uuid,
  target_id uuid,
  payload jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_q text := nullif(trim(coalesce(p_q,'')), '');
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Log admin search action
  perform public.log_admin_action(
    'ADMIN_SEARCH_AUDIT_LOGS',
    null,
    jsonb_build_object(
      'query', v_q,
      'action', p_action,
      'limit', p_limit,
      'offset', p_offset,
      'searched_at', now()
    )
  );

  return query
  with base as (
    select a.*
    from public.admin_audit_log a
    where
      (p_action is null or a.action = p_action)
      and (
        v_q is null
        or a.action ilike '%'||v_q||'%'
        or coalesce(a.payload::text,'') ilike '%'||v_q||'%'
        or coalesce(a.actor_id::text,'') ilike '%'||v_q||'%'
        or coalesce(a.target_id::text,'') ilike '%'||v_q||'%'
      )
  ),
  counted as (
    select count(*)::bigint as total_count from base
  )
  select
    counted.total_count,
    b.id, b.created_at, b.action, b.actor_id, b.target_id, b.payload
  from base b
  cross join counted
  order by b.created_at desc
  limit greatest(1, least(p_limit, 100))
  offset greatest(p_offset, 0);
end;
$$;

-- Grant permission to authenticated users
grant execute on function public.admin_search_audit_logs to authenticated;
