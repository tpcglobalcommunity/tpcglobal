-- Public RPC: check_username_available(username_text)
create or replace function public.check_username_available(username_text text)
returns json
language plpgsql
security definer
as $$
declare
  exists_count int;
begin
  if username_text is null or length(trim(username_text)) < 3 then
    return json_build_object('available', false, 'reason', 'too_short');
  end if;

  select count(*) into exists_count
  from public.profiles
  where lower(username) = lower(trim(username_text));

  return json_build_object('available', (exists_count = 0));
end;
$$;

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text) to anon, authenticated;
