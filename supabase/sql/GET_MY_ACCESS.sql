-- FINAL LOCK - SINGLE SOURCE OF TRUTH FOR ACCESS CONTROL
-- This script creates a unified RPC function for role/verified access checking

create or replace function public.get_my_access()
returns table(role text, verified boolean)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(p.role, 'member') as role,
    coalesce(p.verified, false) as verified
  from public.profiles p
  where p.id = auth.uid()
  union all
  select 'member'::text, false::boolean
  where not exists (select 1 from public.profiles where id = auth.uid());
$$;
