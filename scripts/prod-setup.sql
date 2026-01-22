-- =========================================================
-- PRODUCTION DATABASE SETUP - TPC GLOBAL
-- =========================================================
-- RUN THIS ON THE EXACT SUPABASE PROJECT USED BY PRODUCTION
-- =========================================================

-- 1. First, check if we're on the right project
SELECT 
    'Current Project Info' as info,
    current_database() as database_name,
    current_user() as current_user,
    version() as postgres_version;

-- 2. Drop existing function if it exists (to ensure clean recreation)
DROP FUNCTION IF EXISTS get_app_settings();

-- 3. Create get_app_settings RPC function with proper security
CREATE OR REPLACE FUNCTION get_app_settings()
RETURNS TABLE (
  key TEXT,
  value TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return application settings as key-value pairs
  -- This function is safe to call from frontend
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
    'TPC Global' as value
  UNION ALL
  SELECT 
    'registration_enabled' as key,
    'true' as value
  UNION ALL
  SELECT 
    'verification_enabled' as key,
    'true' as value;
END;
$$;

-- 4. Grant proper permissions to all roles
GRANT EXECUTE ON FUNCTION get_app_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_app_settings() TO service_role;
GRANT EXECUTE ON FUNCTION get_app_settings() TO anon;

-- 5. Verify function exists and is accessible
SELECT 'Function Created' as status, proname as function_name 
FROM pg_proc 
WHERE proname = 'get_app_settings';

-- 6. Test the function (should return 5 rows)
SELECT 'Testing Function' as test_status;
SELECT * FROM get_app_settings();

-- 7. Verify permissions
SELECT 
    'Permission Check' as check_type,
    grantee,
    privilege_type,
    table_schema,
    table_name
FROM information_schema.role_table_grants 
WHERE table_name = 'get_app_settings'
AND table_schema = 'public';

-- 8. Create profiles table if missing (for safety)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  telegram TEXT,
  city TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'member', 'admin', 'super_admin')),
  verified BOOLEAN DEFAULT false,
  can_invite BOOLEAN DEFAULT false,
  tpc_tier TEXT DEFAULT 'basic',
  tpc_balance NUMERIC DEFAULT 0,
  wallet_address TEXT,
  wallet_verified_at TIMESTAMPTZ,
  verification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 11. Final verification
SELECT 
    'Setup Complete' as final_status,
    'TPC Global Production Database Ready' as message,
    now() as completed_at;
