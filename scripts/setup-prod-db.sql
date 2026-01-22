-- PRODUCTION DATABASE SETUP
-- Run this on the production Supabase project

-- 1. Create get_app_settings RPC function
CREATE OR REPLACE FUNCTION get_app_settings()
RETURNS TABLE (
  key TEXT,
  value TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return application settings as key-value pairs
  RETURN QUERY
  SELECT 
    'maintenance_mode' as key,
    'false' as value
  UNION ALL
  SELECT 
    'version' as key,
    '1.0.0' as value
  UNION ALL
  SELECT 
    'app_name' as key,
    'TPC Global' as value;
END;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_settings() TO service_role;
GRANT EXECUTE ON FUNCTION get_app_settings() TO anon;

-- 3. Verify function exists
SELECT 'get_app_settings function created successfully' as status;

-- 4. Test the function
SELECT * FROM get_app_settings() LIMIT 5;
