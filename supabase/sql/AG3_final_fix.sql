-- =========================================================
-- AG3 FINAL FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Final production fix for all runtime errors
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== AG3 FINAL FIX START ===' as step;
SELECT current_database() as database_name, now() as fix_time;

-- 2. CREATE app_settings TABLE (IF NOT EXISTS)
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ADD is_public COLUMN (IF NOT EXISTS)
SELECT '=== ADDING is_public COLUMN ===' as step;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_settings' 
        AND table_schema = 'public' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE '✅ is_public column added to app_settings';
    ELSE
        RAISE NOTICE '✅ is_public column already exists in app_settings';
    END IF;
END $$;

-- 4. BACKFILL is_public COLUMN (SAFE)
SELECT '=== BACKFILLING is_public COLUMN ===' as step;

UPDATE public.app_settings
SET is_public = true
WHERE is_public IS NULL;

-- 5. INSERT DEFAULT SETTINGS (UPSERT)
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('site', '{"en":{"title":"TPC Global","subtitle":"Trader Professional Community"},"id":{"title":"TPC Global","subtitle":"Komunitas Trader Profesional"}}'::jsonb, true),
    ('maintenance', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    is_public = EXCLUDED.is_public,
    updated_at = now();

-- 6. CREATE get_app_settings FUNCTION
SELECT '=== CREATING get_app_settings FUNCTION ===' as step;

DROP FUNCTION IF EXISTS public.get_app_settings();

CREATE FUNCTION public.get_app_settings()
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

-- 7. GRANT PERMISSIONS
SELECT '=== GRANTING PERMISSIONS ===' as step;

GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 8. ENABLE RLS ON app_settings
SELECT '=== ENABLING RLS ON app_settings ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 9. CREATE RLS POLICY FOR app_settings
SELECT '=== CREATING RLS POLICY FOR app_settings ===' as step;

DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;

CREATE POLICY "app_settings_public_read" ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

-- 10. ADD status COLUMN TO profiles (IF NOT EXISTS)
SELECT '=== ADDING status COLUMN TO profiles ===' as step;

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

-- 11. CREATE notifications TABLE (IF NOT EXISTS)
SELECT '=== CREATING notifications TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ENABLE RLS ON notifications
SELECT '=== ENABLING RLS ON notifications ===' as step;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 13. CREATE RLS POLICY FOR notifications
SELECT '=== CREATING RLS POLICY FOR notifications ===' as step;

DROP POLICY IF EXISTS "notifications_user_policy" ON public.notifications;

CREATE POLICY "notifications_user_policy" ON public.notifications
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- 14. CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON public.app_settings(is_public);

-- 15. COMPREHENSIVE TESTING
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

-- 16. FINAL VERIFICATION
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

SELECT '=== AG3 FINAL FIX COMPLETE ===' as step, now() as completed_at;

-- 17. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Should see get_app_settings 200 (not 404)' as instruction_5,
    '6. Should see no profiles.status errors' as instruction_6,
    '7. Should see no notifications 404' as instruction_7;
