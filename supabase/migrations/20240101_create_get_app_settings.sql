-- Migration: Create get_app_settings RPC function
-- This function retrieves application settings for the frontend

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_app_settings();

-- Create the RPC function
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
  -- This is a placeholder implementation
  -- Add your actual settings logic here
  
  RETURN QUERY
  SELECT 
    'maintenance_mode' as key,
    'false' as value
  UNION ALL
  SELECT 
    'version' as key,
    '1.0.0' as value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_settings() TO service_role;
