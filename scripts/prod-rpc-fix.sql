-- =========================================================
-- PRODUCTION RPC FIX - TPC GLOBAL
-- =========================================================
-- SAFE, IDEMPOTENT MIGRATION FOR get_app_settings RPC
-- =========================================================

-- 1. Create app_settings table if not exists
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
DROP POLICY IF EXISTS "Public read access to public settings" ON public.app_settings;
CREATE POLICY "Public read access to public settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Service role full access to app_settings" ON public.app_settings;
CREATE POLICY "Service role full access to app_settings" ON public.app_settings
    FOR ALL USING (auth.role() = 'service_role');

-- 4. Create or replace get_app_settings function
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
            "verification_enabled": true
        }'::jsonb;
    END IF;
    
    RETURN result;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 6. Insert default public settings (idempotent)
INSERT INTO public.app_settings (key, value, is_public) 
VALUES 
    ('maintenance_mode', 'false'::jsonb, true),
    ('version', '"1.0.0"'::jsonb, true),
    ('app_name', '"TPC Global"'::jsonb, true),
    ('registration_enabled', 'true'::jsonb, true),
    ('verification_enabled', 'true'::jsonb, true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = now();

-- 7. Verification queries
SELECT 'Table Verification' as step, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'app_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Function Verification' as step, proname as function_name, prosrc as source 
FROM pg_proc 
WHERE proname = 'get_app_settings';

SELECT 'Policy Verification' as step, policyname, permissive, roles 
FROM pg_policies 
WHERE tablename = 'app_settings';

SELECT 'Data Verification' as step, key, value, is_public, updated_at 
FROM public.app_settings 
WHERE is_public = true;

SELECT 'RPC Test' as step, public.get_app_settings() as result;

SELECT 'Migration Complete' as status, now() as completed_at;
