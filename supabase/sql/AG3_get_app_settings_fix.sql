-- =========================================================
-- AG3 get_app_settings FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Idempotent migration for get_app_settings RPC function
-- =========================================================

-- 0) Extensions (buat gen_random_uuid kalau perlu, aman)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) TABLE app_settings (buat jika belum ada)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Kalau tabel sudah ada tapi kolom belum ada, tambahkan
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS value JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 3) Trigger update timestamp (optional tapi bagus, aman)
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_settings_touch ON public.app_settings;
CREATE TRIGGER trg_app_settings_touch
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 4) Seed minimal (UPSERT)
INSERT INTO public.app_settings (key, value, is_public)
VALUES
  ('site_name', '{"en":"TPC Global","id":"TPC Global"}'::jsonb, true),
  ('maintenance', '{"enabled":false}'::jsonb, true),
  ('version', '"1.0.0"'::jsonb, true),
  ('registration_enabled', 'true'::jsonb, true),
  ('verification_enabled', 'true'::jsonb, true),
  ('notifications_enabled', 'false'::jsonb, true)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    is_public = EXCLUDED.is_public;

-- 5) RPC get_app_settings (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_app_settings()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(s.key, s.value), '{}'::jsonb)
  FROM public.app_settings s
  WHERE s.is_public = true;
$$;

-- 6) Permissions
REVOKE ALL ON FUNCTION public.get_app_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon, authenticated;

-- 7) RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read"
ON public.app_settings
FOR SELECT
TO anon, authenticated
USING (is_public = true);

-- 8) ADD status COLUMN TO profiles (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND table_schema = 'public' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING';
    RAISE NOTICE '✅ status column added to profiles';
  ELSE
    RAISE NOTICE '✅ status column already exists in profiles';
  END IF;
END $$;

-- 9) CREATE notifications TABLE (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10) ENABLE RLS ON notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11) CREATE RLS POLICY FOR notifications
DROP POLICY IF EXISTS "notifications_user_policy" ON public.notifications;
CREATE POLICY "notifications_user_policy" ON public.notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- 12) CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON public.app_settings(is_public);

-- 13) COMPREHENSIVE TESTING
SELECT '=== COMPREHENSIVE TESTING ===' as step;

-- Test get_app_settings function
DO $$
BEGIN
  DECLARE
    result JSONB;
  BEGIN
    SELECT public.get_app_settings() INTO result;
    RAISE NOTICE '✅ get_app_settings test SUCCESS: %', result;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ get_app_settings test FAILED: %', SQLERRM;
  END;
END $$;

-- Test app_settings table
DO $$
BEGIN
  DECLARE
    table_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'app_settings' 
      AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
      RAISE NOTICE '✅ app_settings table test SUCCESS';
    ELSE
      RAISE NOTICE '❌ app_settings table test FAILED';
    END IF;
  END;
END $$;

-- Test profiles.status column
DO $$
BEGIN
  DECLARE
    status_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND table_schema = 'public' 
      AND column_name = 'status'
    ) INTO status_exists;
    
    IF status_exists THEN
      RAISE NOTICE '✅ profiles.status column test SUCCESS';
    ELSE
      RAISE NOTICE '❌ profiles.status column test FAILED';
    END IF;
  END;
END $$;

-- Test notifications table
DO $$
BEGIN
  DECLARE
    table_exists BOOLEAN;
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'notifications' 
      AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
      RAISE NOTICE '✅ notifications table test SUCCESS';
    ELSE
      RAISE NOTICE '❌ notifications table test FAILED';
    END IF;
  END;
END $$;

-- 14) FINAL VERIFICATION
SELECT '=== FINAL VERIFICATION ===' as step;

SELECT 
  'app_settings table' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'get_app_settings function' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'notifications table' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'profiles.status column' as object,
  CASE 
    WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' AND column_name = 'status') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

SELECT '=== AG3 get_app_settings FIX COMPLETE ===' as step, now() as completed_at;

-- 15) FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
  '1. All objects should show ✅ EXISTS' as instruction_1,
  '2. get_app_settings test should show SUCCESS' as instruction_2,
  '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
  '4. Test https://tpcglobal.io/en/home' as instruction_4,
  '5. Should see get_app_settings 200 (not 404)' as instruction_5,
  '6. Should see no profiles.status errors' as instruction_6,
  '7. Should see no notifications 404' as instruction_7;
