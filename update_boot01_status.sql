-- UPDATE TPC-BOOT01 STATUS TO ACTIVE
-- Jalankan di Supabase SQL Editor

-- =====================================================
-- 1. Cek data TPC-BOOT01 sebelum update
-- =====================================================
select 
  id, email, referral_code, role, status, verified, can_invite,
  created_at, updated_at
from public.profiles
where upper(referral_code) = 'TPC-BOOT01'
limit 10;

-- =====================================================
-- 2. Update status TPC-BOOT01 menjadi ACTIVE
-- =====================================================
update public.profiles
set status = 'ACTIVE', verified = true, can_invite = true, updated_at = now()
where upper(referral_code) = 'TPC-BOOT01';

-- =====================================================
-- 3. Verifikasi hasil update
-- =====================================================
select 
  id, email, referral_code, role, status, verified, can_invite,
  created_at, updated_at
from public.profiles
where upper(referral_code) = 'TPC-BOOT01'
limit 10;

-- =====================================================
-- 4. Test function validation setelah update
-- =====================================================
select public.validate_referral_code_public('TPC-BOOT01') as test_upper;
select public.validate_referral_code_public('tpc-boot01') as test_lower;

-- =====================================================
-- 5. Check affected rows (berapa row yang diupdate)
-- =====================================================
select 
  'UPDATE_COMPLETED' as status,
  (select count(*) from public.profiles where upper(referral_code) = 'TPC-BOOT01') as total_boot01_records,
  (select count(*) from public.profiles where upper(referral_code) = 'TPC-BOOT01' and status = 'ACTIVE') as active_boot01_records;
