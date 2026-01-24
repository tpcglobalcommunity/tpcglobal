-- Fix RPC: check_username_available (404 Error)
-- Apply this in Supabase SQL Editor

create or replace function public.check_username_available(p_username text)
returns boolean
language sql
security definer
as $$
  select not exists (
    select 1 from profiles where username = p_username
  );
$$;

-- Grant permissions
grant execute on function public.check_username_available(text) to anon, authenticated;
