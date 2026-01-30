-- Migration: Admin Whitelist + RLS + Safe RPC
-- Security hardening for TPC Global
-- Creates admin whitelist table, enables RLS, and creates safe functions

-- ============================================================================
-- PHASE 1: CREATE ADMIN WHITELIST TABLE (SOURCE OF TRUTH)
-- ============================================================================

-- Create admin_whitelist table if not exists
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
  user_id uuid PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on admin_whitelist
ALTER TABLE public.admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_whitelist
-- Policy 1: Service role can manage all rows
CREATE POLICY "Service role full access" ON public.admin_whitelist
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy 2: Authenticated users can read their own row (optional, for self-check)
CREATE POLICY "Users can read own admin status" ON public.admin_whitelist
  FOR SELECT USING (auth.uid() = user_id);

-- Insert super admin row (idempotent)
INSERT INTO public.admin_whitelist(user_id, note)
VALUES ('cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1', 'Super Admin (bootstrap)')
ON CONFLICT (user_id) DO UPDATE SET 
  note = EXCLUDED.note,
  created_at = LEAST(admin_whitelist.created_at, EXCLUDED.created_at);

-- Create helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_uuid(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_whitelist 
    WHERE user_id = p_user_id
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_uuid(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_uuid(uuid) TO anon;

-- ============================================================================
-- PHASE 2: RLS HARDENING ON SENSITIVE TABLES
-- ============================================================================

-- Enable RLS on existing tables if they exist
DO $$
BEGIN
  -- Enable RLS on tpc_invoices
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tpc_invoices' AND table_schema = 'public') THEN
    ALTER TABLE public.tpc_invoices ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own invoices" ON public.tpc_invoices;
    DROP POLICY IF EXISTS "Admins can view all invoices" ON public.tpc_invoices;
    
    -- Create policies for tpc_invoices
    CREATE POLICY "Users can view own invoices" ON public.tpc_invoices
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all invoices" ON public.tpc_invoices
      FOR SELECT USING (public.is_admin_uuid(auth.uid()));
  END IF;
  
  -- Enable RLS on app_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_settings' AND table_schema = 'public') THEN
    ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Only admins can manage settings" ON public.app_settings;
    
    -- Create policies for app_settings
    CREATE POLICY "Only admins can manage settings" ON public.app_settings
      FOR ALL USING (public.is_admin_uuid(auth.uid()));
  END IF;
  
  -- Enable RLS on profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    
    -- Create policies for profiles
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Admins can view all profiles" ON public.profiles
      FOR SELECT USING (public.is_admin_uuid(auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- PHASE 3: SAFE PUBLIC RPC FUNCTIONS
-- ============================================================================

-- Create safe public function to get invoice (replaces existing if exists)
CREATE OR REPLACE FUNCTION public.get_invoice_public(p_invoice_no text)
RETURNS TABLE (
  invoice_no text,
  status text,
  stage text,
  tpc_amount numeric,
  total_usd numeric,
  total_idr numeric,
  created_at timestamptz,
  paid_at timestamptz,
  treasury_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_no text;
BEGIN
  -- Validate invoice_no format (basic validation)
  v_invoice_no := trim(p_invoice_no);
  IF v_invoice_no IS NULL OR length(v_invoice_no) < 3 THEN
    RETURN;
  END IF;
  
  -- Return query result
  RETURN QUERY
  SELECT 
    invoice_no,
    status,
    stage,
    tpc_amount,
    total_usd,
    total_idr,
    created_at,
    paid_at,
    treasury_address
  FROM public.tpc_invoices
  WHERE invoice_no = v_invoice_no;
  
  RETURN;
END;
$$;

-- Grant execute permissions for public RPC
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO authenticated;

-- Create admin check function for frontend
CREATE OR REPLACE FUNCTION public.get_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_admin_uuid(auth.uid());
END;
$$;

-- Grant execute permissions for admin check
GRANT EXECUTE ON FUNCTION public.get_is_admin() TO authenticated;

-- ============================================================================
-- PHASE 4: UPDATE EXISTING IS_ADMIN FUNCTION (if exists)
-- ============================================================================

-- Update existing is_admin function to use whitelist
CREATE OR REPLACE FUNCTION public.is_admin(p_email text DEFAULT NULL, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user_id is provided, check against whitelist
  IF p_user_id IS NOT NULL THEN
    RETURN public.is_admin_uuid(p_user_id);
  END IF;
  
  -- If only email is provided, try to find user_id from profiles
  IF p_email IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.admin_whitelist aw ON p.user_id = aw.user_id
      WHERE p.email = p_email
    );
  END IF;
  
  -- Default: check current user
  RETURN public.is_admin_uuid(auth.uid());
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(text, uuid) TO service_role;

-- ============================================================================
-- PHASE 5: VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Test queries (commented out, uncomment for testing)
/*
-- Test 1: Check if super admin is in whitelist
SELECT * FROM public.admin_whitelist WHERE user_id = 'cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1';

-- Test 2: Test is_admin_uuid function
SELECT public.is_admin_uuid('cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1');

-- Test 3: Test get_invoice_public function (replace with actual invoice_no)
SELECT * FROM public.get_invoice_public('TPC123456');

-- Test 4: Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('tpc_invoices', 'app_settings', 'profiles', 'admin_whitelist');

-- Test 5: Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Admin whitelist, RLS, and safe RPC functions created';
  RAISE NOTICE 'Super admin UUID: cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1 added to whitelist';
END $$;
