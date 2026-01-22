-- =========================================================
-- EMERGENCY PRODUCTION FIX - TPC GLOBAL
-- =========================================================
-- Aggressive fix for all remaining errors
-- =========================================================

-- 1. COMPLETE RESET OF get_app_settings
SELECT '=== EMERGENCY FIX START ===' as step;

-- Drop everything related to app_settings
DROP FUNCTION IF EXISTS public.get_app_settings() CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Service role full access app_settings" ON public.app_settings;

-- 2. CREATE app_settings TABLE FROM SCRATCH
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSERT DEFAULT DATA IMMEDIATELY
INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true);

-- 4. CREATE SIMPLE get_app_settings FUNCTION
CREATE OR REPLACE FUNCTION public.get_app_settings()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT jsonb_build_object(
        'maintenance_mode', COALESCE((SELECT value::boolean FROM public.app_settings WHERE key = 'maintenance_mode'), false),
        'version', COALESCE((SELECT value::text FROM public.app_settings WHERE key = 'version'), '"1.0.0"'),
        'app_name', COALESCE((SELECT value::text FROM public.app_settings WHERE key = 'app_name'), '"TPC Global"'),
        'registration_enabled', COALESCE((SELECT value::boolean FROM public.app_settings WHERE key = 'registration_enabled'), true),
        'verification_enabled', COALESCE((SELECT value::boolean FROM public.app_settings WHERE key = 'verification_enabled'), true),
        'notifications_enabled', COALESCE((SELECT value::boolean FROM public.app_settings WHERE key = 'notifications_enabled'), false)
    );
$$;

-- 5. GRANT PERMISSIONS IMMEDIATELY
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 6. FORCE ADD status COLUMN TO profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';

-- 7. CREATE notifications TABLE IF MISSING
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 9. ENABLE RLS WITH SIMPLE POLICIES
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;

-- Create simple policies
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 10. IMMEDIATE TESTING
SELECT '=== IMMEDIATE TESTING ===' as step;

-- Test get_app_settings
DO $$
BEGIN
    DECLARE
        result JSONB;
    BEGIN
        SELECT public.get_app_settings() INTO result;
        RAISE NOTICE '✅ get_app_settings SUCCESS: %', result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_app_settings FAILED: %', SQLERRM;
    END;
END $$;

-- Test profiles.status
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
            RAISE NOTICE '✅ profiles.status column EXISTS';
        ELSE
            RAISE NOTICE '❌ profiles.status column MISSING';
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
            RAISE NOTICE '✅ notifications table EXISTS';
        ELSE
            RAISE NOTICE '❌ notifications table MISSING';
        END IF;
    END;
END $$;

-- 11. FINAL VERIFICATION
SELECT '=== FINAL VERIFICATION ===' as step;

-- Check function
SELECT 
    'get_app_settings function' as item,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- Check tables
SELECT 
    'app_settings table' as item,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'notifications table' as item,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'profiles.status column' as item,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' AND column_name = 'status') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT '=== EMERGENCY FIX COMPLETE ===' as step, now() as completed_at;

-- 12. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT INSTRUCTIONS ===' as step;
SELECT 
    '1. Run this script in production Supabase' as instruction_1,
    '2. Check NOTICE messages for ✅ confirmations' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Verify no more 404 or missing column errors' as instruction_5;
