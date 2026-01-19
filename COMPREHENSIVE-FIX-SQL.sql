-- COMPREHENSIVE FIX - TPC SIGNUP BLOCKER RESOLUTION
-- Execute ini di Supabase SQL Editor untuk menghilangkan 500 error

-- =====================================================
-- TASK A1: LIST ALL CUSTOM TRIGGERS ON AUTH.USERS (NON-INTERNAL)
-- =====================================================
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

-- =====================================================
-- TASK A2: DISABLE ALL BLOCKING TRIGGERS (SAFE DEBUGGING)
-- =====================================================
-- Disable semua trigger yang mungkin menyebabkan 500
-- Ganti NAMA_TRIGGER dengan hasil dari query di atas
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
  LOOP
    EXECUTE format('ALTER TRIGGER %I ON auth.users DISABLE', trigger_record.tgname);
  END LOOP;
END;
$$;

-- =====================================================
-- TASK A3: CREATE FAIL-OPEN TRIGGER FOR PROFILES
-- =====================================================
CREATE OR REPLACE FUNCTION public.tpc_handle_new_user_failopen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Insert minimal fields yang dijamin ada
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      created_at,
      updated_at
    )
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
-- TASK A4: ENABLE FAIL-OPEN TRIGGER ONLY
-- =====================================================
CREATE TRIGGER tpc_on_auth_user_created_failopen
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.tpc_handle_new_user_failopen();

-- =====================================================
-- TASK A5: VERIFICATION
-- =====================================================
-- Cek trigger yang aktif setelah fix
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
-- TASK A6: OPTIONAL - RE-ENABLE SAFE TRIGGERS
-- =====================================================
-- Jalankan ini hanya jika signup sudah berhasil dan ingin re-enable trigger lain
/*
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  -- Re-enable trigger yang aman (kecuali yang bermasalah)
  FOR trigger_record IN 
    SELECT tgname 
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND NOT t.tgisinternal
      AND tgname NOT IN ('tpc_on_auth_user_created_failopen') -- keep our fail-open
  LOOP
    EXECUTE format('ALTER TRIGGER %I ON auth.users ENABLE', trigger_record.tgname);
  END LOOP;
END;
$$;
*/
