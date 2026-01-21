-- =====================================================
-- ADMIN EXPORT AUDIT LOGS RPC FUNCTION
-- =====================================================

-- Export function for admin audit log data export
create or replace function public.admin_export_audit_logs(
  p_q text default null,
  p_action text default null,
  p_limit int default 5000
) returns setof public.admin_audit_log
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

  -- Log admin export action
  perform public.log_admin_action(
    'ADMIN_EXPORT_AUDIT_LOGS',
    null,
    jsonb_build_object(
      'query', v_q,
      'action', p_action,
      'limit', p_limit,
      'exported_at', now()
    )
  );

  return query
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
  order by a.created_at desc
  limit greatest(1, least(p_limit, 10000));
end;
$$;

-- Grant permission to authenticated users
grant execute on function public.admin_export_audit_logs to authenticated;
