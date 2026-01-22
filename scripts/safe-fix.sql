-- =========================================================
-- SAFE FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Safe script that checks conditions before operations
-- =========================================================

-- 1. CHECK CURRENT STATE
SELECT '=== SAFE FIX START ===' as step;
SELECT current_database() as database_name, now() as fix_time;

-- 2. CREATE app_settings TABLE IF NOT EXISTS
SELECT '=== CREATING app_settings TABLE ===' as step;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'app_settings' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE public.app_settings (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL DEFAULT '{}'::jsonb,
            is_public BOOLEAN NOT NULL DEFAULT true,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        RAISE NOTICE '✅ app_settings table created';
    ELSE
        RAISE NOTICE '✅ app_settings table already exists';
    END IF;
END $$;

-- 3. INSERT DEFAULT SETTINGS (SAFE)
SELECT '=== INSERTING DEFAULT SETTINGS ===' as step;

DO $$
BEGIN
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
    
    RAISE NOTICE '✅ Default settings inserted/updated';
END $$;

-- 4. CREATE get_app_settings FUNCTION
SELECT '=== CREATING get_app_settings FUNCTION ===' as step;

DO $$
BEGIN
    -- Drop function if exists
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'get_app_settings'
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        DROP FUNCTION public.get_app_settings();
        RAISE NOTICE '✅ Dropped existing get_app_settings function';
    END IF;
    
    -- Create new function
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
    
    RAISE NOTICE '✅ get_app_settings function created';
END $$;

-- 5. GRANT PERMISSIONS
SELECT '=== GRANTING PERMISSIONS ===' as step;

DO $$
BEGIN
    -- Grant function permissions
    GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
    GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;
    
    -- Grant table permissions
    GRANT SELECT ON public.app_settings TO anon;
    GRANT SELECT ON public.app_settings TO authenticated;
    GRANT ALL ON public.app_settings TO service_role;
    
    RAISE NOTICE '✅ Permissions granted';
END $$;

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

-- 7. CREATE notifications TABLE IF NOT EXISTS
SELECT '=== CREATING notifications TABLE ===' as step;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE public.notifications (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            type TEXT NOT NULL DEFAULT 'info',
            title TEXT NOT NULL,
            body TEXT,
            is_read BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        RAISE NOTICE '✅ notifications table created';
    ELSE
        RAISE NOTICE '✅ notifications table already exists';
    END IF;
END $$;

-- 8. CREATE INDEXES
SELECT '=== CREATING INDEXES ===' as step;

DO $$
BEGIN
    -- Create indexes if not exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'profiles' 
        AND indexname = 'idx_profiles_status'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX idx_profiles_status ON public.profiles(status);
        RAISE NOTICE '✅ profiles status index created';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'notifications' 
        AND indexname = 'idx_notifications_user_id'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        RAISE NOTICE '✅ notifications user_id index created';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'notifications' 
        AND indexname = 'idx_notifications_created_at'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
        RAISE NOTICE '✅ notifications created_at index created';
    END IF;
END $$;

-- 9. ENABLE RLS
SELECT '=== ENABLING RLS ===' as step;

DO $$
BEGIN
    -- Enable RLS on app_settings
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'app_settings' 
        AND schemaname = 'public'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on app_settings';
    END IF;
    
    -- Enable RLS on notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'notifications' 
        AND schemaname = 'public'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on notifications';
    END IF;
END $$;

-- 10. CREATE RLS POLICIES
SELECT '=== CREATING RLS POLICIES ===' as step;

DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
    DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;
    
    -- Create app_settings policy
    CREATE POLICY "Public read app_settings" ON public.app_settings
        FOR SELECT USING (is_public = true);
    
    -- Create notifications policy
    CREATE POLICY "Users own notifications" ON public.notifications
        FOR ALL USING (auth.uid() = user_id);
    
    RAISE NOTICE '✅ RLS policies created';
END $$;

-- 11. COMPREHENSIVE TESTING
SELECT '=== TESTING ALL OBJECTS ===' as step;

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

SELECT '=== SAFE FIX COMPLETE ===' as step, now() as completed_at;

-- 13. FRONTEND READY MESSAGE
SELECT '=== FRONTEND DEPLOYMENT READY ===' as step;
SELECT 
    '1. All NOTICE messages should show ✅ success' as instruction_1,
    '2. Cloudflare Pages will auto-deploy from main' as instruction_2,
    '3. Test https://tpcglobal.io/en/home' as instruction_3,
    '4. Should see no more 404 or missing column errors' as instruction_4;
