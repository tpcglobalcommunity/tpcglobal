-- =========================================================
-- ULTRA SIMPLE FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Most basic script without any conditional logic
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== ULTRA SIMPLE FIX START ===' as step;
SELECT current_database() as database_name, now() as fix_time;

-- 2. CREATE app_settings TABLE (BASIC)
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSERT DEFAULT SETTINGS (BASIC)
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true);

-- 4. CREATE get_app_settings FUNCTION (BASIC)
SELECT '=== CREATING get_app_settings FUNCTION ===' as step;

CREATE FUNCTION public.get_app_settings()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT jsonb_build_object(
        'maintenance_mode', (SELECT value::boolean FROM public.app_settings WHERE key = 'maintenance_mode'),
        'version', (SELECT value::text FROM public.app_settings WHERE key = 'version'),
        'app_name', (SELECT value::text FROM public.app_settings WHERE key = 'app_name'),
        'registration_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'registration_enabled'),
        'verification_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'verification_enabled'),
        'notifications_enabled', (SELECT value::boolean FROM public.app_settings WHERE key = 'notifications_enabled')
    );
$$;

-- 5. GRANT PERMISSIONS (BASIC)
SELECT '=== GRANTING PERMISSIONS ===' as step;

GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- 6. ADD status COLUMN TO profiles (BASIC)
SELECT '=== ADDING status COLUMN ===' as step;

ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

-- 7. CREATE notifications TABLE (BASIC)
SELECT '=== CREATING notifications TABLE ===' as step;

CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CREATE INDEXES (BASIC)
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- 9. ENABLE RLS (BASIC)
SELECT '=== ENABLING RLS ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. CREATE RLS POLICIES (BASIC)
SELECT '=== CREATING RLS POLICIES ===' as step;

CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 11. TEST FUNCTION (BASIC)
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

-- 12. FINAL VERIFICATION (BASIC)
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

SELECT '=== ULTRA SIMPLE FIX COMPLETE ===' as step, now() as completed_at;

-- 13. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Should see no more 404 or missing column errors' as instruction_5;
