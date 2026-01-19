-- =========================================
-- FIX SIGNUP 500: BYPASS RLS ON profiles INSERT
-- =========================================

-- 0) (Optional) lihat trigger yang ada dulu
-- select * from information_schema.triggers
-- where event_object_schema='auth' and event_object_table='users';

-- 1) Drop trigger lama kalau ada
drop trigger if exists on_auth_user_created on auth.users;

-- 2) Drop function lama kalau ada
drop function if exists public.handle_new_user() cascade;

-- 3) Buat function baru (SECURITY DEFINER = bypass RLS)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_full_name text;
  v_username text;
  v_ref_code text;
  v_referred_by uuid;
begin
  v_full_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  v_username  := nullif(trim(new.raw_user_meta_data->>'username'), '');
  v_ref_code  := nullif(trim(new.raw_user_meta_data->>'referral_code'), '');

  -- Referral optional: kalau invalid, biarkan null (JANGAN throw error)
  if v_ref_code is not null then
    select p.id into v_referred_by
    from public.profiles p
    where upper(p.referral_code) = upper(v_ref_code)
    limit 1;
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    username,
    referred_by
  ) values (
    new.id,
    new.email,
    v_full_name,
    v_username,
    v_referred_by
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    username = coalesce(excluded.username, public.profiles.username),
    referred_by = coalesce(excluded.referred_by, public.profiles.referred_by),
    updated_at = now();

  return new;
end;
$$;

-- 4) Kunci permission function (aman)
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;

-- 5) Pasang trigger baru
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
