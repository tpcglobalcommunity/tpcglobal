-- 1) Cek struktur kolom profiles terlebih dahulu
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- 2) Fix aman untuk kolom yang biasanya ada (jalankan setelah lihat hasil di atas)
-- Hapus NOT NULL untuk kolom yang pasti ada
alter table public.profiles
  alter column full_name drop not null,
  alter column city drop not null;

-- 3) Tambah kolom yang dibutuhkan flow baru (kalau belum ada)
-- Kolom untuk wajib setelah login
alter table public.profiles
  add column if not exists telegram text,
  add column if not exists phone text;

-- Opsional: kolom tambahan untuk gate layanan
alter table public.profiles
  add column if not exists wallet_address text,
  add column if not exists tpc_balance numeric default 0;

-- 4) Update trigger untuk handle kolom baru (jalankan setelah kolom siap)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, username, referral_code, role, verified, can_invite, status, full_name, telegram, phone, city)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', ''),
    new.raw_user_meta_data->>'referral_code',
    'member',
    false,
    false,
    'PENDING',
    null,
    null,
    null,
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 5) Pastikan trigger terpasang
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
