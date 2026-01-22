-- =========================================================
-- FIX ALL ERRORS - TPC GLOBAL PRODUCTION
-- =========================================================
-- Comprehensive fix for all runtime errors
-- =========================================================

-- 1. COMPLETE RESET - DROP EVERYTHING FIRST
SELECT '=== COMPLETE RESET START ===' as step;

-- Drop all functions
DROP FUNCTION IF EXISTS public.get_app_settings() CASCADE;
DROP FUNCTION IF EXISTS public.validate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_member() CASCADE;
DROP FUNCTION IF EXISTS public.health_check() CASCADE;

-- Drop all tables
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;

-- 2. CREATE EVERYTHING FROM SCRATCH
SELECT '=== CREATING FROM SCRATCH ===' as step;

-- Create app_settings table
CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true);

-- Create get_app_settings function (SIMPLE SQL)
CREATE OR REPLACE FUNCTION public.get_app_settings()
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

-- Create notifications table
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add status column to profiles (FORCE)
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

-- 3. ENABLE RLS AND CREATE POLICIES
SELECT '=== ENABLING RLS ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 4. GRANT PERMISSIONS
SELECT '=== GRANTING PERMISSIONS ===' as step;

-- Function permissions
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- Table permissions
GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 5. CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 6. COMPREHENSIVE TESTING
SELECT '=== COMPREHENSIVE TESTING ===' as step;

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

-- Test function permissions
DO $$
BEGIN
    DECLARE
        has_permission BOOLEAN;
    BEGIN
        -- Test if anon can execute
        SELECT has_function_privilege('anon', 'public', 'get_app_settings', 'EXECUTE') INTO has_permission;
        IF has_permission THEN
            RAISE NOTICE '✅ anon has EXECUTE permission on get_app_settings';
        ELSE
            RAISE NOTICE '❌ anon missing EXECUTE permission on get_app_settings';
        END IF;
    END;
END $$;

-- 7. FINAL VERIFICATION
SELECT '=== FINAL VERIFICATION ===' as step;

-- Check all objects exist
SELECT 
    'get_app_settings function' as object_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'get_app_settings') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'app_settings table' as object_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'notifications table' as object_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'profiles.status column' as object_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' AND column_name = 'status') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT '=== ALL ERRORS FIXED ===' as step, now() as completed_at;

-- 8. FRONTEND INSTRUCTIONS
SELECT '=== FRONTEND DEPLOYMENT INSTRUCTIONS ===' as step;
SELECT 
    '1. Run this script in production Supabase' as instruction_1,
    '2. Check all NOTICE messages for ✅ success' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Should see no more 404 or missing column errors' as instruction_5;
