-- =========================================================
-- FINAL FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Ultra simple fix with user-specified additions
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== FINAL FIX START ===' as step;
SELECT current_database() as database_name, now() as fix_time;

-- 2. CREATE app_settings TABLE (BASIC)
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ADD MISSING COLUMN (SAFE) - User Requested
SELECT '=== ADDING MISSING COLUMN (SAFE) ===' as step;

ALTER TABLE public.app_settings
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- 4. OPTIONAL: INDEX FOR FASTER PUBLIC READS - User Requested
SELECT '=== CREATING INDEX FOR PUBLIC READS ===' as step;

CREATE INDEX IF NOT EXISTS app_settings_is_public_idx 
ON public.app_settings (is_public);

-- 5. BACKFILL (JUST IN CASE OLD ROWS EXIST AND ARE NULL) - User Requested
SELECT '=== BACKFILLING OLD ROWS ===' as step;

UPDATE public.app_settings
SET is_public = false
WHERE is_public IS NULL;

-- 6. INSERT DEFAULT SETTINGS (BASIC)
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true);

-- 7. CREATE get_app_settings FUNCTION (BASIC)
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

-- 8. GRANT PERMISSIONS (BASIC)
SELECT '=== GRANTING PERMISSIONS ===' as step;

GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- 9. ADD status COLUMN TO profiles (BASIC)
SELECT '=== ADDING status COLUMN ===' as step;

ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';

-- 10. CREATE notifications TABLE (BASIC)
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

-- 11. CREATE INDEXES (BASIC)
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- 12. ENABLE RLS (BASIC)
SELECT '=== ENABLING RLS ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 13. CREATE RLS POLICIES (BASIC)
SELECT '=== CREATING RLS POLICIES ===' as step;

CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 14. TEST FUNCTION (BASIC)
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

-- 15. FINAL VERIFICATION (BASIC)
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

-- 16. VERIFY is_public COLUMN
SELECT '=== VERIFYING is_public COLUMN ===' as step;

SELECT 
    'is_public column' as check,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND table_schema = 'public' AND column_name = 'is_public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT '=== FINAL FIX COMPLETE ===' as step, now() as completed_at;

-- 17. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. is_public column should show ✅ EXISTS' as instruction_3,
    '4. Cloudflare Pages will auto-deploy from main' as instruction_4,
    '5. Test https://tpcglobal.io/en/home' as instruction_5,
    '6. Should see no more 404 or missing column errors' as instruction_6;
