-- TRIGGER ANALYSIS - TPC SIGNUP
-- Hasil query menunjukkan trigger yang sedang aktif

-- =====================================================
-- ANALYSIS: 
-- Trigger yang ditemukan di auth.users
-- =====================================================

-- Jalankan query ini untuk melihat trigger yang ada:
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='auth'
  AND c.relname='users'
  AND NOT t.tgisinternal;

-- =====================================================
-- KEMUNGKINAN OUTPUT:
-- 1. Tidak ada trigger sama sekali
-- 2. Ada trigger lama yang menyebabkan 500
-- 3. Ada trigger yang sudah benar

-- =====================================================
-- ACTION PLAN:
-- 1. Lihat hasil query di atas
-- 2. Jika ada trigger yang bermasalah, disable dulu
-- 3. Jalankan trigger baru yang non-blocking
-- 4. Test signup

-- =====================================================
-- EMERGENCY FIX (jika perlu disable trigger lama):
-- DROP TRIGGER IF EXISTS nama_trigger_lama ON auth.users;

-- =====================================================
-- FINAL FIX (jalankan setelah lihat hasil query):
-- Gunakan FINAL-SQL-FIX.sql yang sudah disiapkan
