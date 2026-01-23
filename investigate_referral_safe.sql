-- INVESTIGASI REFERRAL VALIDATION TPC-BOOT01 (SAFE VERSION)
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
-- 4) Cek tabel referral_codes (jika ada)
-- =====================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'referral_codes'
    ) THEN
        SELECT 'referral_codes' as table_name, COUNT(*) as count 
        FROM public.referral_codes 
        WHERE UPPER(code) = 'TPC-BOOT01';
    ELSE
        SELECT 'referral_codes' as table_name, 0 as count;
    END IF;
END $$;

-- =====================================================
-- 5) Manual test query untuk memastikan logic
-- =====================================================

-- Manual test query yang seharusnya digunakan oleh RPC
SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE UPPER(referral_code) = 'TPC-BOOT01'
    AND status = 'ACTIVE'
) as manual_test;

-- =====================================================
-- 6. Cek semua referral codes yang ada (untuk debugging)
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
-- 7. Jika tidak ada data TPC-BOOT01, insert seed data
-- =====================================================

-- Cek dulu apakah sudah ada
SELECT 'Checking if TPC-BOOT01 exists...' as status;

-- Insert seed data jika belum ada (jalankan manual jika perlu)
/*
INSERT INTO public.profiles (
    id, 
    email, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'seed@tpcglobal.io',
    'TPC-BOOT01',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    NOW(),
    NOW()
);
*/

-- =====================================================
-- 8. Function template yang benar (jika perlu recreate)
-- =====================================================

/*
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
