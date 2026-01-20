-- STEP A: CEK SCHEMA profiles
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by ordinal_position;

-- STEP B: ADD COLUMN referral_code + constraint (JIKA BELUM ADA)
alter table public.profiles
add column if not exists referral_code text;

create unique index if not exists profiles_referral_code_unique
on public.profiles (referral_code)
where referral_code is not null;

-- STEP C: BUAT FUNCTION GENERATE KODE (AMAN, UNIQUE)
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  loop
    code := 'TPC-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 8));
    exit when not exists (
      select 1 from public.profiles where referral_code = code
    );
  end loop;
  return code;
end;
$$;

-- STEP D: TRIGGER: AUTO-SET referral_code SAAT INSERT PROFILE (AUTOFILL)
create or replace function public.set_referral_code_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.referral_code is null or new.referral_code = '' then
    new.referral_code := public.generate_referral_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_referral_code_on_insert on public.profiles;

create trigger trg_set_referral_code_on_insert
before insert on public.profiles
for each row
execute function public.set_referral_code_on_insert();

-- STEP E: BACKFILL USER LAMA (YANG SUDAH ADA PROFILE)
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null or referral_code = '';

-- STEP F: OPTIONAL: PAKSA RELOAD SCHEMA CACHE (BIAR POSTGREST CEPAT UPDATE)
select pg_notify('pgrst', 'reload schema');

-- STEP G: TEST CEPAT (PASTIKAN KODE ADA)
select id, email, full_name, referral_code, updated_at
from public.profiles
order by updated_at desc
limit 10;
