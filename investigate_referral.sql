-- INVESTIGASI REFERRAL VALIDATION TPC-BOOT01
-- Jalankan script ini di Supabase SQL Editor

-- =====================================================
-- 1) Test RPC function langsung
-- =====================================================

-- Test dengan uppercase
select public.validate_referral_code_public('TPC-BOOT01') as boot01_upper;

-- Test dengan lowercase (seharusnya case-insensitive)
select public.validate_referral_code_public('tpc-boot01') as boot01_lower;

-- Test dengan mixed case
select public.validate_referral_code_public('TPC-boot01') as boot01_mixed;

-- =====================================================
-- 2) Cek definisi function RPC
-- =====================================================

SELECT 
    routine_name,
    routine_definition,
    external_language
FROM information_schema.routines 
WHERE routine_name = 'validate_referral_code_public';

-- =====================================================
-- 3) Cari data referral code BOOT01 di tabel profiles
-- =====================================================

-- Cek semua record dengan referral_code TPC-BOOT01 (case-insensitive)
select 
    id, 
    email, 
    username, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
from public.profiles
where upper(trim(referral_code)) = 'TPC-BOOT01'
limit 20;

-- =====================================================
-- 4) Cek di tabel lain yang mungkin menyimpan referral codes
-- =====================================================

-- Cek di referral_codes table (jika ada)
SELECT 'referral_codes' as table_name, COUNT(*) as count 
FROM public.referral_codes 
WHERE UPPER(code) = 'TPC-BOOT01';

-- Cek di invitation_codes table (jika ada)
SELECT 'invitation_codes' as table_name, COUNT(*) as count 
FROM public.invitation_codes 
WHERE UPPER(code) = 'TPC-BOOT01';

-- =====================================================
-- 5) Test query manual untuk memastikan logic
-- =====================================================

-- Manual test query yang seharusnya digunakan oleh RPC
SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE UPPER(referral_code) = 'TPC-BOOT01'
    AND status = 'ACTIVE'
) as manual_test;

-- =====================================================
-- 6) Cek semua referral codes yang ada (untuk debugging)
-- =====================================================

-- Lihat semua referral codes yang aktif
SELECT 
    referral_code,
    COUNT(*) as usage_count,
    MAX(created_at) as latest_usage
FROM public.profiles 
WHERE referral_code IS NOT NULL 
AND referral_code != ''
GROUP BY referral_code
ORDER BY usage_count DESC
LIMIT 10;

-- =====================================================
-- INSTRUKSI ANALISIS HASIL:
-- =====================================================

/*
1. Jika RPC mengembalikan NULL/error:
   - Function tidak ada atau error di definisi

2. Jika RPC mengembalikan false tapi manual_test mengembalikan true:
   - Function logic salah, perlu diperbaiki

3. Jika tidak ada record TPC-BOOT01 di profiles:
   - Perlu insert seed data TPC-BOOT01

4. Jika record ada tapi status != 'ACTIVE':
   - Update status ke 'ACTIVE'

5. Jika function tidak case-insensitive:
   - Tambahkan UPPER() di query function

CONTOH FUNCTION YANG BENAR:
CREATE OR REPLACE FUNCTION validate_referral_code_public(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE UPPER(referral_code) = UPPER(p_code)
        AND status = 'ACTIVE'
    ) INTO result;
    
    RETURN result;
END;
$$;
*/
