-- =====================================================
-- ADMIN EXPORT MEMBERS RPC FUNCTION
-- =====================================================

-- Export function for admin member data export
create or replace function public.admin_export_members(
  p_q text default null,
  p_status text default null,
  p_role text default null,
  p_verified boolean default null,
  p_limit int default 5000
) returns setof public.profiles
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
    'ADMIN_EXPORT_MEMBERS',
    null,
    jsonb_build_object(
      'query', v_q,
      'status', p_status,
      'role', p_role,
      'verified', p_verified,
      'limit', p_limit,
      'exported_at', now()
    )
  );

  return query
  select p.*
  from public.profiles p
  where
    (p_status is null or p.status = p_status)
    and (p_role is null or p.role = p_role)
    and (p_verified is null or p.verified = p_verified)
    and (
      v_q is null
      or p.email ilike '%'||v_q||'%'
      or p.full_name ilike '%'||v_q||'%'
      or p.username ilike '%'||v_q||'%'
    )
  order by p.created_at desc
  limit greatest(1, least(p_limit, 10000));
end;
$$;

-- Grant permission to authenticated users
grant execute on function public.admin_export_members to authenticated;
