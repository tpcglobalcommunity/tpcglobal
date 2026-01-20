-- A) Pastikan field yang diisi belakangan boleh kosong saat signup
-- Jalankan ini di Supabase SQL Editor

-- 1) Drop NOT NULL constraints untuk field yang diisi nanti
alter table public.profiles
  alter column full_name drop not null,
  alter column telegram drop not null,
  alter column phone drop not null,
  alter column city drop not null;

-- Opsional: biar benar-benar null-able (hapus default values)
alter table public.profiles
  alter column full_name drop default,
  alter column telegram drop not null,
  alter column phone drop not null,
  alter column city drop not null;

-- B) Pastikan trigger create profile ambil username dari metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, username, referral_code, role, verified, can_invite, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', ''),
    new.raw_user_meta_data->>'referral_code',
    'member',
    false,
    false,
    'PENDING'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- C) Pastikan trigger terpasang dengan benar
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
