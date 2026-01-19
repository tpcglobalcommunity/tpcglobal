-- DISABLE BOOTSTRAP TRIGGERS - SAFE FIX FOR TPC SIGNUP
-- Execute ini di Supabase SQL Editor untuk non-aktifkan trigger berbahaya

-- =====================================================
-- STEP 1: DISABLE TRIGGER BOOTSTRAP YANG MUNGKIN ADA
-- =====================================================

-- Non-aktifkan trigger yang mungkin terkait bootstrap/admin
DO $$
DECLARE
  trigger_record RECORD;
  disabled_count INTEGER := 0;
BEGIN
  -- Cari dan non-aktifkan trigger yang berbahaya
  FOR trigger_record IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
      AND (
        LOWER(tgname) LIKE '%bootstrap%'
        OR LOWER(tgname) LIKE '%admin%'
        OR LOWER(tgname) LIKE '%super%'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER TRIGGER %I ON auth.users DISABLE', trigger_record.tgname);
      disabled_count := disabled_count + 1;
      RAISE NOTICE 'Disabled trigger: %', trigger_record.tgname;
    END LOOP;
    
  IF disabled_count > 0 THEN
    RAISE NOTICE 'Bootstrap/Admin triggers disabled: % triggers', disabled_count;
  END IF;
END;
$$;

-- =====================================================
-- STEP 2: ENABLE FAIL-OPEN TRIGGER (JIKAN BELUM ADA)
-- =====================================================

-- Pastikan trigger fail-open yang aman sudah aktif
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'tpc_on_auth_user_created_failopen'
      AND t.tgenabled = false
  ) THEN
    EXECUTE '
      CREATE TRIGGER tpc_on_auth_user_created_failopen
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.tpc_handle_new_user_failopen();
    ';
    RAISE NOTICE 'Enabled fail-open trigger: tpc_on_auth_user_created_failopen';
  END IF;
END;
$$;

-- =====================================================
-- STEP 3: VERIFIKASI STATUS TRIGGER
-- =====================================================

-- Cek status trigger setelah perbaikan
SELECT
  t.tgname AS trigger_name,
  CASE WHEN t.tgenabled THEN 'ENABLED' ELSE 'DISABLED' END as status,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- =====================================================
-- STEP 4: CEK FUNCTION YANG MASIH AKTIF
-- =====================================================

-- Cek apakah ada function bootstrap yang masih aktif
SELECT 
  proname AS function_name,
  pronamespace AS function_schema,
  prosrc AS function_source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND (
    LOWER(prosrc) LIKE '%bootstrap%' 
    OR LOWER(prosrc) LIKE '%admin%'
    OR LOWER(prosrc) LIKE '%super%'
  )
ORDER BY proname;

-- =====================================================
-- STEP 5: TEST SIGNUP USER BIASA
-- =====================================================

-- Setelah menjalankan SQL di atas, test signup:
-- Expected: Tidak ada 500 error, user berhasil dibuat

-- =====================================================
-- DOCUMENTASI
-- =====================================================

-- Catat perubahan yang dilakukan:
-- - Trigger bootstrap yang dinon-aktifkan
-- - Trigger fail-open yang diaktifkan
-- - Status akhir semua trigger

-- =====================================================
-- NEXT STEPS
-- =====================================================

-- 1. Test signup user biasa
-- 2. Verifikasi tidak ada 500 error
-- 3. Check console untuk error detail
-- 4. Deploy jika sudah aman
