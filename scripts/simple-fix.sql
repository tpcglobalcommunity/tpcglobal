-- =========================================================
-- SIMPLE FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Simple script without complex functions
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== SIMPLE FIX START ===' as step;
SELECT current_database() as database_name, now() as fix_time;

-- 2. CREATE app_settings TABLE
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSERT DEFAULT SETTINGS
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

-- 4. CREATE get_app_settings FUNCTION (SIMPLE)
SELECT '=== CREATING get_app_settings FUNCTION ===' as step;

DROP FUNCTION IF EXISTS public.get_app_settings();

CREATE FUNCTION public.get_app_settings()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Build result object step by step
    SELECT '{}'::jsonb INTO result;
    
    -- Add maintenance_mode
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'maintenance_mode') THEN
        SELECT jsonb_set(result, '{maintenance_mode}', (SELECT value FROM public.app_settings WHERE key = 'maintenance_mode')) INTO result;
    END IF;
    
    -- Add version
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'version') THEN
        SELECT jsonb_set(result, '{version}', (SELECT value FROM public.app_settings WHERE key = 'version')) INTO result;
    END IF;
    
    -- Add app_name
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'app_name') THEN
        SELECT jsonb_set(result, '{app_name}', (SELECT value FROM public.app_settings WHERE key = 'app_name')) INTO result;
    END IF;
    
    -- Add registration_enabled
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'registration_enabled') THEN
        SELECT jsonb_set(result, '{registration_enabled}', (SELECT value FROM public.app_settings WHERE key = 'registration_enabled')) INTO result;
    END IF;
    
    -- Add verification_enabled
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'verification_enabled') THEN
        SELECT jsonb_set(result, '{verification_enabled}', (SELECT value FROM public.app_settings WHERE key = 'verification_enabled')) INTO result;
    END IF;
    
    -- Add notifications_enabled
    IF EXISTS (SELECT 1 FROM public.app_settings WHERE key = 'notifications_enabled') THEN
        SELECT jsonb_set(result, '{notifications_enabled}', (SELECT value FROM public.app_settings WHERE key = 'notifications_enabled')) INTO result;
    END IF;
    
    RETURN result;
END;
$$;

-- 5. GRANT PERMISSIONS
SELECT '=== GRANTING PERMISSIONS ===' as step;

GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- 6. ADD status COLUMN TO profiles
SELECT '=== ADDING status COLUMN ===' as step;

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

-- 7. CREATE notifications TABLE
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

-- 8. CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 9. ENABLE RLS
SELECT '=== ENABLING RLS ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. CREATE RLS POLICIES
SELECT '=== CREATING RLS POLICIES ===' as step;

DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;

CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 11. TEST FUNCTION
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

-- 12. FINAL VERIFICATION
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

SELECT '=== SIMPLE FIX COMPLETE ===' as step, now() as completed_at;

-- 13. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4;
