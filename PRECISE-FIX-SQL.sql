-- PRECISE SQL FIX - TPC SIGNUP (BERDASARKAN ANALYSIS TRIGGER)
-- Execute ini di Supabase SQL Editor untuk menghilangkan 500 error

-- =====================================================
-- STEP 1: Disable trigger lama yang menyebabkan 500
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- =====================================================
-- STEP 2: Buat function fail-open (non-blocking)
-- =====================================================
CREATE OR REPLACE FUNCTION public.tpc_handle_new_user_failopen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert minimal fields saja supaya tidak kena NOT NULL constraint yang tidak perlu
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
-- STEP 3: Buat trigger baru yang aman
-- =====================================================
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
  ) THEN
    EXECUTE '
      CREATE TRIGGER tpc_on_auth_user_created_failopen
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.tpc_handle_new_user_failopen();
    ';
  END IF;
END
$$;

-- =====================================================
-- STEP 4: Verifikasi trigger sudah dibuat
-- =====================================================
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- =====================================================
-- STEP 5: Test signup verification
-- =====================================================
-- Setelah menjalankan SQL di atas, test signup:
-- Expected result:
-- 1. Tidak ada 500 error
-- 2. UI tampil "Check your email"
-- 3. Console log [SIGNUP_API] Success
-- 4. User berhasil dibuat di auth.users
-- 5. Profile bisa dibuat belakangan via MemberGuard

-- Jika semua criteria terpenuhi → DEPLOY SEKARANG
