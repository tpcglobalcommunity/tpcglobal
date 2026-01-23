-- Investigasi referral data untuk TPC-BOOT01

-- 1. Cek semua tabel yang mungkin menyimpan referral codes
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles WHERE UPPER(referral_code) = 'TPC-BOOT01' UNION ALL
SELECT 'referral_codes' as table_name, COUNT(*) as count FROM public.referral_codes WHERE UPPER(code) = 'TPC-BOOT01' UNION ALL
SELECT 'invitation_codes' as table_name, COUNT(*) as count FROM public.invitation_codes WHERE UPPER(code) = 'TPC-BOOT01';

-- 2. Cek detail jika ada di profiles
SELECT id, email, username, referral_code, role, status, verified, can_invite, created_at, updated_at 
FROM public.profiles 
WHERE UPPER(referral_code) = 'TPC-BOOT01';

-- 3. Cek definisi function RPC
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'validate_referral_code_public';

-- 4. Test function RPC langsung (ini akan menunjukkan hasil aktual)
SELECT public.validate_referral_code_public('TPC-BOOT01') as test_result;

-- 5. Test function dengan case variations
SELECT 
  public.validate_referral_code_public('TPC-BOOT01') as test_upper,
  public.validate_referral_code_public('tpc-boot01') as test_lower,
  public.validate_referral_code_public('TPC-boot01') as test_mixed;
