-- =========================================================
-- PRODUCTION MIGRATION - TPC GLOBAL
-- =========================================================
-- Target: https://nhscvoqyjtpaskeqaths.supabase.co
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== PRODUCTION MIGRATION START ===' as step;
SELECT current_database() as database_name, now() as migration_time;

-- 2. CREATE app_settings TABLE
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ENABLE RLS ON app_settings
SELECT '=== ENABLING RLS ON app_settings ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICY FOR app_settings
SELECT '=== CREATING RLS POLICY FOR app_settings ===' as step;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

-- 5. INSERT DEFAULT SETTINGS
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true),
    ('site', '{"title": "TPC Global", "description": "Trader Professional Community"}'::jsonb, true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
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
    SELECT jsonb_build_object(
        'maintenance_mode', (SELECT value::boolean FROM public.app_settings WHERE key = 'maintenance_mode' AND is_public = true),
        'version', (SELECT value::text FROM public.app_settings WHERE key = 'version' AND is_public = true),
        'app_name', (SELECT value::text FROM public.app_settings WHERE key = 'app_name' AND is_public = true),
        'registration_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'registration_enabled' AND is_public = true),
        'verification_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'verification_enabled' AND is_public = true),
        'notifications_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'notifications_enabled' AND is_public = true),
        'site', (SELECT value FROM public.app_settings WHERE key = 'site' AND is_public = true)
    );
$$;

-- 7. GRANT PERMISSIONS FOR get_app_settings
SELECT '=== GRANTING PERMISSIONS FOR get_app_settings ===' as step;

GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 8. ADD status COLUMN TO profiles
SELECT '=== ADDING status COLUMN TO profiles ===' as step;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
        RAISE NOTICE '✅ status column added to profiles';
    ELSE
        RAISE NOTICE '✅ status column already exists in profiles';
    END IF;
END $$;

-- 9. CREATE notifications TABLE
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

-- 10. ENABLE RLS ON notifications
SELECT '=== ENABLING RLS ON notifications ===' as step;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. CREATE RLS POLICY FOR notifications
SELECT '=== CREATING RLS POLICY FOR notifications ===' as step;

DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;
CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 12. CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON public.app_settings(is_public);

-- 13. TEST get_app_settings FUNCTION
SELECT '=== TESTING get_app_settings FUNCTION ===' as step;

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

-- 14. FINAL VERIFICATION
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

SELECT '=== PRODUCTION MIGRATION COMPLETE ===' as step, now() as completed_at;

-- 15. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Should see get_app_settings 200 (not 404)' as instruction_5;
