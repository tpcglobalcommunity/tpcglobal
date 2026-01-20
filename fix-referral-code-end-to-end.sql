-- STEP 1: DATABASE - PASTIKAN referral_code ADA
alter table public.profiles
add column if not exists referral_code text unique;

-- STEP 2: CEK CURRENT STATE
select 
  count(*) as total_users,
  count(referral_code) as users_with_code,
  count(*) - count(referral_code) as users_without_code
from public.profiles;

-- STEP 3: BUAT GENERATOR FUNCTION (jika belum ada)
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

-- STEP 4: TRIGGER AUTO-GENERATE SAAT INSERT
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

-- STEP 5: BACKFILL USER LAMA
update public.profiles
set referral_code = public.generate_referral_code()
where referral_code is null or referral_code = '';

-- STEP 6: VERIFIKASI HASIL
select 
  id,
  email,
  full_name,
  referral_code,
  updated_at
from public.profiles
order by updated_at desc
limit 10;

-- STEP 7: RELOAD SCHEMA CACHE
select pg_notify('pgrst', 'reload schema');
