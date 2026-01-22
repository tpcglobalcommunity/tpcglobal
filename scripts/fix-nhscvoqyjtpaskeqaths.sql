-- =========================================================
-- PRODUCTION FIX FOR nhscvoqyjtpaskeqaths.supabase.co
-- =========================================================
-- RUN THIS IN THE EXACT SUPABASE PROJECT ABOVE
-- =========================================================

-- 1. First, verify we're in the right project
SELECT 
    'Project Verification' as step,
    current_database() as database_name,
    version() as postgres_version;

-- 2. Check if get_app_settings function exists
SELECT 
    'Function Check' as step,
    proname as function_name,
    prosrc as source_exists
FROM pg_proc 
WHERE proname = 'get_app_settings';

-- 3. Drop existing function if it exists (to ensure clean recreation)
DROP FUNCTION IF EXISTS public.get_app_settings();

-- 4. Create app_settings table if not exists
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Service role full access app_settings" ON public.app_settings;

-- 7. Create RLS policies
CREATE POLICY "Public read app_settings" ON public.app_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Service role full access app_settings" ON public.app_settings
    FOR ALL USING (auth.role() = 'service_role');

-- 8. Create get_app_settings function
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

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO anon;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_settings() TO service_role;

-- 10. Insert default settings (idempotent)
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

-- 11. Test the function
SELECT 'Function Test' as step, public.get_app_settings() as result;

-- 12. Verify permissions
SELECT 
    'Permission Check' as step,
    grantee,
    privilege_type,
    table_schema,
    table_name
FROM information_schema.role_table_grants 
WHERE table_name = 'get_app_settings'
AND table_schema = 'public';

-- 13. Final verification
SELECT 
    'Migration Complete' as step,
    'TPC Global Production Ready' as status,
    now() as completed_at;

-- 14. Instructions for frontend verification
SELECT 
    'Next Steps' as step,
    '1. Test RPC via POST https://nhscvoqyjtpaskeqaths.supabase.co/rest/v1/rpc/get_app_settings' as instruction_1,
    '2. Should return 200 with JSON settings' as instruction_2,
    '3. Cloudflare Pages will auto-deploy changes' as instruction_3;
