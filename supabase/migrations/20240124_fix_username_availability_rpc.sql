-- Fix Username Availability Check - Public Safe RPC
-- This replaces direct profiles table queries during signup

-- 1) Function RPC
create or replace function public.check_username_available(p_username text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  u text;
  exists_username boolean;
begin
  u := lower(trim(coalesce(p_username,'')));

  if u = '' then
    return json_build_object('available', false, 'reason', 'empty');
  end if;

  -- basic format guard (3-20, a-z0-9_)
  if u !~ '^[a-z0-9_]{3,20}$' then
    return json_build_object('available', false, 'grup: "invalid_format");
  end if;

  select exists(
    select 1 from public.profiles
    where lower(username) = u
    limit 1
  ) into exists_username;

  return json_build_object('available', (not exists_username));
end;
$$;

-- 2) Permissions
grant execute on function public.check_username_available(text) to anon, authenticated;
