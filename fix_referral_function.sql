-- FIX REFERRAL VALIDATION FUNCTION
-- Jalankan di Supabase SQL Editor

-- =====================================================
-- 1. Drop existing function (jika ada)
-- =====================================================
drop function if exists public.validate_referral_code_public(text);

-- =====================================================
-- 2. Create new function dengan logic yang benar
-- =====================================================
create or replace function public.validate_referral_code_public(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where upper(trim(referral_code)) = upper(trim(p_code))
  );
end;
$$;

-- =====================================================
-- 3. Grant execute permissions
-- =====================================================
grant execute on function public.validate_referral_code_public(text)
to anon, authenticated;

-- =====================================================
-- 4. Test function setelah update
-- =====================================================
select public.validate_referral_code_public('TPC-BOOT01') as test_upper;
select public.validate_referral_code_public('tpc-boot01') as test_lower;

-- =====================================================
-- 5. Cek data TPC-BOOT01 (jika belum ada, insert seed)
-- =====================================================
select 
  id, email, referral_code, role, status, can_invite,
  created_at, updated_at
from public.profiles
where upper(trim(referral_code)) = 'TPC-BOOT01'
limit 10;

-- =====================================================
-- 6. Insert seed data TPC-BOOT01 jika belum ada
-- =====================================================
insert into public.profiles (
    id, 
    email, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
) values (
    gen_random_uuid(),
    'seed@tpcglobal.io',
    'TPC-BOOT01',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    now(),
    now()
) on conflict (id) do nothing;

-- =====================================================
-- 7. Final test setelah insert data
-- =====================================================
select public.validate_referral_code_public('TPC-BOOT01') as final_test;

-- =====================================================
-- 8. Debug: Lihat semua referral codes yang ada
-- =====================================================
select 
  referral_code,
  count(*) as usage_count,
  max(created_at) as latest_usage
from public.profiles
where referral_code is not null and trim(referral_code) <> ''
group by referral_code
order by usage_count desc
limit 10;
