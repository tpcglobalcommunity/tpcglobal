-- 0) Tambah flag completion (aman, tidak ganggu constraint status)
alter table public.profiles
add column if not exists profile_completed boolean not null default false;

-- Optional: index kecil biar cepat kalau nanti query admin
create index if not exists profiles_profile_completed_idx
on public.profiles(profile_completed);

-- 1) Pastikan cuma ada SATU trigger di auth.users (buang yang lama biar tidak konflik)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_tpc on auth.users;
drop trigger if exists on_auth_user_created_v2 on auth.users;
drop trigger if exists on_auth_user_created_v3 on auth.users;

-- 2) Fungsi trigger super aman (fail-open) + referral mapping + increment referral_count
create or replace function public.tpc_handle_new_user_failopen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref_code text;
  v_username text;
  v_inviter_id uuid;
begin
  -- ambil metadata dari signup
  v_ref_code := coalesce(new.raw_user_meta_data->>'referralCode', new.raw_user_meta_data->>'referral_code', '');
  v_username := coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'username', '');

  begin
    -- cari inviter berdasarkan referral code
    select p.id into v_inviter_id
    from public.profiles p
    where upper(p.referral_code) = upper(v_ref_code)
    limit 1;

    -- buat profile minimal (jangan isi full_name/phone/telegram/kota di tahap signup)
    insert into public.profiles (
      id,
      email,
      username,
      referral_code,
      referred_by,
      referral_count,
      role,
      status,
      can_invite,
      is_verified,
      profile_completed,
      created_at,
      updated_at
    ) values (
      new.id,
      new.email,
      nullif(v_username, ''),
      nullif(v_ref_code, ''),
      v_inviter_id,
      0,
      'MEMBER',
      'ACTIVE',
      false,
      false,
      false,
      now(),
      now()
    )
    on conflict (id) do nothing;

    -- naikkan referral_count inviter kalau inviter ketemu
    if v_inviter_id is not null then
      update public.profiles
      set referral_count = coalesce(referral_count, 0) + 1,
          updated_at = now()
      where id = v_inviter_id;
    end if;

  exception when others then
    -- fail-open: user tetap jadi, profile bisa dibuat belakangan
    raise warning 'Profile trigger failed for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

-- 3) Pasang trigger baru (SINGLE SOURCE OF TRUTH)
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.tpc_handle_new_user_failopen();
