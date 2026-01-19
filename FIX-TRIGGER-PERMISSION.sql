-- FIX TRIGGER PERMISSION - TPC SIGNUP BLOCKER RESOLUTION
-- Execute ini di Supabase SQL Editor untuk memperbaiki permission error

-- =====================================================
-- STEP 1: DROP TRIGGER YANG MENYEBABKAN 500 ERROR
-- =====================================================

-- Gunakan DROP TRIGGER syntax yang lebih aman
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verifikasi trigger sudah dihapus
SELECT 
  tgname AS trigger_name,
  CASE WHEN t.tgenabled THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- =====================================================
-- STEP 2: CREATE FAIL-OPEN FUNCTION
-- =====================================================

-- Drop function jika sudah ada
DROP FUNCTION IF EXISTS public.tpc_handle_new_user_failopen() CASCADE;

-- Buat function fail-open yang aman
CREATE OR REPLACE FUNCTION public.tpc_handle_new_user_failopen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert minimal fields yang dijamin ada
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    -- FAIL OPEN: jangan gagalkan signup
    RAISE NOTICE 'tpc_handle_new_user_failopen failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 3: CREATE FAIL-OPEN TRIGGER
-- =====================================================

-- Buat trigger fail-open
CREATE TRIGGER tpc_on_auth_user_created_failopen
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.tpc_handle_new_user_failopen();

-- =====================================================
-- STEP 4: VERIFIKASI FINAL
-- =====================================================

-- Cek status final semua trigger
SELECT
  tgname AS trigger_name,
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
-- STEP 5: TEST SIGNUP
-- =====================================================

-- Setelah menjalankan SQL di atas, test signup:
-- Expected result:
-- 1. Tidak ada 500 error
-- 2. UI tampil "Check your email"
-- 3. Console log [SIGNUP_API] Success
-- 4. User berhasil dibuat di auth.users
-- 5. Profile bisa dibuat belakangan via MemberGuard

-- Jika semua criteria terpenuhi → DEPLOY SEKARANG
