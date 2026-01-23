-- PRODUCTION REFERRAL VALIDATION FIX - TPC GLOBAL
-- Jalankan di Supabase SQL Editor

-- =====================================================
-- 1. CREATE/UPDATE FUNCTION RPC - EXACT SPEC
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE upper(trim(referral_code)) = upper(trim(p_code))
  );
END;
$$;

-- =====================================================
-- 2. GRANT PERMISSIONS - ANON & AUTHENTICATED
-- =====================================================
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text)
TO anon, authenticated;

-- =====================================================
-- 3. VERIFY FUNCTION EXISTS AND WORKS
-- =====================================================
SELECT 
  'FUNCTION_CREATED' as status,
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'validate_referral_code_public';

-- =====================================================
-- 4. TEST FUNCTION WITH TPC-BOOT01
-- =====================================================
SELECT public.validate_referral_code_public('TPC-BOOT01') as test_boot01_upper;
SELECT public.validate_referral_code_public('tpc-boot01') as test_boot01_lower;

-- =====================================================
-- 5. VERIFY TPC-BOOT01 DATA EXISTS
-- =====================================================
SELECT 
  id, email, referral_code, role, status, verified, can_invite,
  created_at, updated_at
FROM public.profiles
WHERE upper(trim(referral_code)) = 'TPC-BOOT01'
LIMIT 5;

-- =====================================================
-- 6. COUNT TOTAL REFERRAL CODES IN SYSTEM
-- =====================================================
SELECT 
  COUNT(DISTINCT referral_code) as total_referral_codes,
  COUNT(*) as total_profiles_with_referrals
FROM public.profiles 
WHERE referral_code IS NOT NULL AND trim(referral_code) <> '';

-- =====================================================
-- 7. LIST TOP 10 REFERRAL CODES
-- =====================================================
SELECT 
  referral_code,
  COUNT(*) as usage_count,
  MAX(created_at) as latest_usage
FROM public.profiles 
WHERE referral_code IS NOT NULL AND trim(referral_code) <> ''
GROUP BY referral_code
ORDER BY usage_count DESC
LIMIT 10;
