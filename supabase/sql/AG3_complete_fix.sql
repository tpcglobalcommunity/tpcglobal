-- =========================================================
-- AG3 COMPLETE FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Complete production fix for all runtime errors
-- Target: https://watoxiwtdnkpxdirkvvf.supabase.co
-- =========================================================

-- 1) CREATE app_settings TABLE WITH COMPLETE SCHEMA
SELECT '=== CREATING app_settings TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) ADD MISSING COLUMNS (SAFE)
SELECT '=== ADDING MISSING COLUMNS ===' as step;

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
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_settings' 
        AND table_schema = 'public' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
        RAISE NOTICE '✅ created_at column added to app_settings';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_settings' 
        AND table_schema = 'public' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        RAISE NOTICE '✅ updated_at column added to app_settings';
    END IF;
END $$;

-- 3) BACKFILL NULL VALUES
SELECT '=== BACKFILLING NULL VALUES ===' as step;

UPDATE public.app_settings
SET is_public = true
WHERE is_public IS NULL;

UPDATE public.app_settings
SET created_at = now()
WHERE created_at IS NULL;

UPDATE public.app_settings
SET updated_at = now()
WHERE updated_at IS NULL;

-- 4) CREATE updated_at TRIGGER
SELECT '=== CREATING updated_at TRIGGER ===' as step;

CREATE OR REPLACE FUNCTION public.tg_app_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.tg_app_settings_updated_at();

-- 5) CREATE get_app_settings FUNCTION
SELECT '=== CREATING get_app_settings FUNCTION ===' as step;

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

-- 6) GRANT PERMISSIONS
SELECT '=== GRANTING PERMISSIONS ===' as step;

REVOKE ALL ON FUNCTION public.get_app_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 7) ENABLE RLS ON app_settings
SELECT '=== ENABLING RLS ON app_settings ===' as step;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 8) CREATE RLS POLICIES FOR app_settings
SELECT '=== CREATING RLS POLICIES FOR app_settings ===' as step;

DROP POLICY IF EXISTS "app_settings_public_read" ON public.app_settings;
CREATE POLICY "app_settings_public_read" ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

DROP POLICY IF EXISTS "app_settings_admin_manage" ON public.app_settings;
CREATE POLICY "app_settings_admin_manage" ON public.app_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 9) INSERT DEFAULT SETTINGS
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

INSERT INTO public.app_settings (key, value, is_public)
VALUES 
    ('site', '{"en":{"title":"TPC Global","subtitle":"Trader Professional Community"},"id":{"title":"TPC Global","subtitle":"Komunitas Trader Profesional"}}'::jsonb, true),
    ('maintenance', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true),
    ('notifications_enabled', 'false'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    is_public = EXCLUDED.is_public,
    updated_at = now();

-- 10) CREATE notifications TABLE
SELECT '=== CREATING notifications TABLE ===' as step;

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11) ENABLE RLS ON notifications
SELECT '=== ENABLING RLS ON notifications ===' as step;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 12) CREATE RLS POLICIES FOR notifications
SELECT '=== CREATING RLS POLICIES FOR notifications ===' as step;

DROP POLICY IF EXISTS "notifications_user_policy" ON public.notifications;
CREATE POLICY "notifications_user_policy" ON public.notifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 13) CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON public.app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON public.app_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 14) COMPREHENSIVE TESTING
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
        is_public_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'app_settings' 
            AND table_schema = 'public'
        ) INTO table_exists;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'app_settings' 
            AND table_schema = 'public' 
            AND column_name = 'is_public'
        ) INTO is_public_exists;
        
        IF table_exists AND is_public_exists THEN
            RAISE NOTICE '✅ app_settings table test SUCCESS';
        ELSE
            RAISE NOTICE '❌ app_settings table test FAILED';
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

-- 15) FINAL VERIFICATION
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
    'app_settings.is_public column' as object,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND table_schema = 'public' AND column_name = 'is_public') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

SELECT '=== AG3 COMPLETE FIX FINISHED ===' as step, now() as completed_at;

-- 16) FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All objects should show ✅ EXISTS' as instruction_1,
    '2. get_app_settings test should show SUCCESS' as instruction_2,
    '3. Cloudflare Pages will auto-deploy from main' as instruction_3,
    '4. Test https://tpcglobal.io/en/home' as instruction_4,
    '5. Should see get_app_settings 200 (not 404)' as instruction_5,
    '6. Should see no profiles.status errors' as instruction_6,
    '7. Should see no notifications 404' as instruction_7,
    '8. Should see no i18n raw keys' as instruction_8;
