-- ==========================================
-- R) MEMBER SETTINGS: SAFE SELF PROFILE UPDATE (RPC)
-- ==========================================

create or replace function public.member_update_profile_self(
  p_username text default null,
  p_full_name text default null,
  p_city text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v_username text;
  v_full_name text;
  v_city text;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  -- Basic normalization
  v_username := nullif(trim(coalesce(p_username,'')), '');
  v_full_name := nullif(trim(coalesce(p_full_name,'')), '');
  v_city := nullif(trim(coalesce(p_city,'')), '');

  -- Simple username rules (optional)
  if v_username is not null then
    if length(v_username) < 3 or length(v_username) > 20 then
      return jsonb_build_object('ok', false, 'error', 'USERNAME_LENGTH');
    end if;
    if v_username !~ '^[a-zA-Z0-9_]+$' then
      return jsonb_build_object('ok', false, 'error', 'USERNAME_FORMAT');
    end if;

    -- unique username (case-insensitive)
    if exists (
      select 1 from public.profiles
      where lower(username) = lower(v_username)
      and id <> actor
    ) then
      return jsonb_build_object('ok', false, 'error', 'USERNAME_TAKEN');
    end if;
  end if;

  update public.profiles
  set
    username = coalesce(v_username, username),
    full_name = coalesce(v_full_name, full_name),
    city = coalesce(v_city, city),
    updated_at = now()
  where id = actor;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.member_update_profile_self(text, text, text) to authenticated;
