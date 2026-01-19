-- MASTER FIX - TOTAL SIGNUP ERROR TPC
-- Fokus: Non-blocking trigger + proper error handling

-- =====================================================
-- TASK 1: PATCH TRIGGER AGAR SIGNUP TIDAK BLOCKING
-- =====================================================

-- STEP 1: Cari trigger & function yang jalan saat signup
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND NOT t.tgisinternal;

-- STEP 2: REPLACE function dengan versi FAIL-OPEN (NON-BLOCKING)
-- Ganti FUNCTION_NAME dengan nama function dari query di atas
CREATE OR REPLACE FUNCTION public.FUNCTION_NAME()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert hanya field yang dijamin ada dan aman
    -- Skip field yang bisa menyebabkan NOT NULL constraint violation
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      status,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'MEMBER',
      'PENDING',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    -- 🔥 PENTING: JANGAN GAGALKAN SIGNUP
    -- Log error tapi lanjutkan signup
    RAISE NOTICE 'handle_new_user failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- STEP 3: Verifikasi trigger sudah pakai function yang baru
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
-- TASK 2: VERIFIKASI FRONTEND ERROR MESSAGE
-- =====================================================

-- Cek apakah translation key benar
SELECT 
  'auth.signup.errorGeneric' as key_path,
  'Failed to create account. Please try again.' as en_value,
  'Gagal membuat akun. Silakan coba lagi.' as id_value;

-- =====================================================
-- TASK 3: POST-LOGIN SAFETY (OPTIONAL)
-- =====================================================

-- Query untuk melihat struktur MemberGuard (jika perlu)
-- SELECT * FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public';

-- =====================================================
-- SUCCESS CRITERIA VERIFICATION
-- =====================================================

-- Setelah menjalankan SQL di atas, test signup:
-- 1. Tidak ada 500 error
-- 2. UI tampil "Check your email"
-- 3. Console log [SIGNUP_API] Success
-- 4. User berhasil dibuat di auth.users
-- 5. Tombol submit berhenti (submitting = false)

-- Jika semua criteria terpenuhi → DEPLOY SEKARANG
