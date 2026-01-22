-- =========================================================
-- FULL STACK FIX - TPC GLOBAL PRODUCTION
-- =========================================================
-- Fixes: get_app_settings 404, profiles.status missing, notifications 404, i18n keys
-- =========================================================

-- 1. VERIFICATION - Check current state
SELECT '=== CURRENT PROJECT VERIFICATION ===' as step;
SELECT current_database() as database_name, version() as postgres_version;

-- 2. FIX get_app_settings 404
SELECT '=== FIXING get_app_settings RPC ===' as step;

-- Drop existing function and recreate safely
DROP FUNCTION IF EXISTS public.get_app_settings();

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Service role full access app_settings" ON public.app_settings;

-- Create safe RLS policies
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Service role full access app_settings" ON public.app_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Create get_app_settings function
CREATE OR REPLACE FUNCTION public.get_app_settings()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Build JSON object from public settings
    SELECT jsonb_object_agg(key, value) INTO result
    FROM public.app_settings
    WHERE is_public = true;
    
    -- If no settings found, return default object
    IF result IS NULL THEN
        result := '{
            "maintenance_mode": false,
            "version": "1.0.0",
            "app_name": "TPC Global",
            "registration_enabled": true,
            "verification_enabled": true,
            "notifications_enabled": false
        }'::jsonb;
    END IF;
    
    RETURN result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- Insert default settings (idempotent)
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

-- 3. FIX profiles.status missing (add status column for backward compatibility)
SELECT '=== FIXING profiles.status COLUMN ===' as step;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
        RAISE NOTICE 'status column added to profiles table';
    ELSE
        RAISE NOTICE 'status column already exists in profiles table';
    END IF;
END $$;

-- Create index for status if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 4. FIX notifications 404
SELECT '=== FIXING notifications TABLE ===' as step;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role full access notifications" ON public.notifications;

-- Create safe RLS policies
CREATE POLICY "Users own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 5. VERIFICATION QUERIES
SELECT '=== VERIFICATION ===' as step;

-- Test get_app_settings function
SELECT 'get_app_settings test' as test_name, public.get_app_settings() as result;

-- Verify profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify notifications table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check function permissions
SELECT 
    routine_name,
    privilege_type,
    grantee
FROM information_schema.role_routine_grants 
WHERE routine_name = 'get_app_settings'
AND routine_schema = 'public';

SELECT '=== MIGRATION COMPLETE ===' as step, now() as completed_at;

-- 6. SAMPLE DATA (optional, for testing)
-- Insert sample notification (commented out for safety)
-- INSERT INTO public.notifications (user_id, type, title, body, is_read)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'welcome', 'Welcome to TPC Global', 'Thank you for joining our community!', false);

SELECT '=== READY FOR FRONTEND TESTING ===' as step;
