-- AUDIT BOOTSTRAP TRIGGERS - TPC SIGNUP BLOCKER ANALYSIS
-- Execute ini di Supabase SQL Editor untuk menganalisis script bootstrap

-- =====================================================
-- TASK A: CEK APAKAH SCRIPT BOOTSTRAP TERPASANG SEBAGAI TRIGGER
-- =====================================================

-- 1) List semua trigger di auth.users
SELECT
  t.tgname AS trigger_name,
  n2.nspname AS function_schema,
  p.proname AS function_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n2 ON n2.oid = p.pronamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 2) Cari function yang mengandung kata 'bootstrap' atau 'admin'
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

-- 3) Cari trigger yang mungkin terkait bootstrap
SELECT
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  tgfoid::regproc AS function_name
FROM pg_trigger t
JOIN pg_namespace n ON n.oid = t.tgrelid
WHERE n.nspname = 'auth'
  AND NOT t.tgisinternal
  AND (
    LOWER(tgname) LIKE '%bootstrap%'
    OR LOWER(tgname) LIKE '%admin%'
    OR LOWER(tgname) LIKE '%super%'
  );

-- =====================================================
-- TASK B: ANALISIS HASIL
-- =====================================================

-- Jika menemukan trigger/function bootstrap:
-- 1. Periksa apakah trigger menyebabkan signup rollback
-- 2. Periksa apakah function melakukan insert ke profiles
-- 3. Periksa constraint yang mungkin dilanggar

-- =====================================================
-- TASK C: LANGKAH AMAN UNTUK NON-AKTIFKAN
-- =====================================================

-- Non-aktifkan trigger bootstrap jika ditemukan (SAFE)
/*
-- Contoh jika menemukan trigger 'bootstrap_admin_trigger':
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'bootstrap_admin_trigger'
  ) THEN
    EXECUTE 'ALTER TRIGGER bootstrap_admin_trigger ON auth.users DISABLE';
    RAISE NOTICE 'Bootstrap admin trigger disabled for safety';
  END IF;
END;
$$;
*/

-- =====================================================
-- TASK D: VERIFIKASI SETELAH NON-AKTIFKAN
-- =====================================================

-- Test signup user biasa untuk memastikan tidak ada 500 error
-- Expected: User berhasil dibuat di auth.users tanpa error

-- =====================================================
-- TASK E: LANGKAH PERBAIKAN JIKA SCRIPT DIBUTUHKAN ULANG
-- =====================================================

-- Jika script memang diperlukan untuk bootstrap admin:
-- 1. Pastikan script hanya berjalan untuk admin creation spesifik
-- 2. Tidak otomatis berjalan saat signup user biasa
-- 3. Gunakan parameter atau flag untuk mengontrol eksekusi

-- =====================================================
-- TASK F: DOKUMENTASI TEMUAN
-- =====================================================

-- Catat semua temuan:
-- - Nama trigger yang ditemukan
-- - Function yang terkait
-- - Constraint yang dilanggar
-- - Langkah yang diambil untuk fix

-- =====================================================
-- NEXT STEPS
-- =====================================================

-- 1. Jalankan query audit di atas
-- 2. Analisis hasilnya
-- 3. Non-aktifkan trigger berbahaya jika ditemukan
-- 4. Test signup user biasa
-- 5. Deploy jika sudah aman
