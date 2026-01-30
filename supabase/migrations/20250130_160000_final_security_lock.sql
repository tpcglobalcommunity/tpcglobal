-- Final Security Lock: RPC Privacy + RLS Completion
-- Prevents admin UUID enumeration and completes least-privilege RLS policies

-- ============================================================================
-- PHASE 1 — RPC PRIVACY HARDENING (MANDATORY)
-- ============================================================================

-- A) Restrict EXECUTE on is_admin_uuid to prevent enumeration
REVOKE EXECUTE ON FUNCTION public.is_admin_uuid(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_uuid(uuid) FROM authenticated;
-- Only service_role (default) and postgres can execute

-- B) Ensure get_is_admin is the ONLY client-facing admin check
GRANT EXECUTE ON FUNCTION public.get_is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_is_admin() FROM anon;
-- Only authenticated users can check their own admin status

-- C) Ensure other admin functions are properly restricted
REVOKE EXECUTE ON FUNCTION public.is_admin(text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(text, uuid) FROM authenticated;
-- Only service_role can use legacy admin check with parameters

-- ============================================================================
-- PHASE 2 — RLS POLICIES COMPLETION (SAFE MINIMUM)
-- ============================================================================

-- A) profiles - Add UPDATE own profile policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    -- Drop existing update policy if it exists
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    -- Create update policy for own profile
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- B) tpc_invoices - Confirm no direct INSERT/UPDATE for authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tpc_invoices' AND table_schema = 'public') THEN
    -- Remove any existing INSERT/UPDATE policies for authenticated users
    DROP POLICY IF EXISTS "Users can insert invoices" ON public.tpc_invoices;
    DROP POLICY IF EXISTS "Users can update invoices" ON public.tpc_invoices;
    
    -- Keep only SELECT policies (existing from previous migration)
    -- No INSERT/UPDATE policies - invoices should be created via RPC only
  END IF;
END $$;

-- C) admin_whitelist - Ensure no SELECT for regular users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_whitelist' AND table_schema = 'public') THEN
    -- Drop any policies that allow regular users to read admin_whitelist
    DROP POLICY IF EXISTS "Users can read own admin status" ON public.admin_whitelist;
    
    -- Only service role policy should remain (from previous migration)
    -- This prevents enumeration of admin UUIDs
  END IF;
END $$;

-- ============================================================================
-- PHASE 3 — SAFE PUBLIC RPC VALIDATION
-- ============================================================================

-- A) Ensure get_invoice_public is executable by anon + authenticated
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO authenticated;

-- B) Ensure get_is_admin is executable by authenticated only
GRANT EXECUTE ON FUNCTION public.get_is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_is_admin() FROM anon;

-- ============================================================================
-- PHASE 4 — VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Test queries (commented out, uncomment for testing)
/*
-- Test 1: As anon - should work
SELECT public.get_invoice_public('TPC123456');

-- Test 2: As anon - should FAIL (permission denied)
SELECT public.get_is_admin();

-- Test 3: As anon - should FAIL (permission denied)
SELECT public.is_admin_uuid('some-uuid');

-- Test 4: As authenticated non-admin - should return false
SELECT public.get_is_admin();

-- Test 5: As authenticated - should be able to update own profile
UPDATE public.profiles SET email = 'new@example.com' WHERE user_id = auth.uid();

-- Test 6: As authenticated - should NOT be able to insert invoices directly
INSERT INTO public.tpc_invoices (invoice_no, buyer_email, tpc_amount, total_usd, total_idr, payment_method, treasury_address, stage, status)
VALUES ('TPC999999', 'test@example.com', 1000, 1.0, 17000, 'USDC', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw', 'stage1', 'PENDING');
-- Should FAIL with permission denied

-- Test 7: Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 8: Check function permissions
SELECT routine_name, routine_type, security_type, external_name, external_language
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%admin%'
ORDER BY routine_name;
*/

-- ============================================================================
-- SECURITY SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== FINAL SECURITY LOCK COMPLETED ===';
  RAISE NOTICE '1. is_admin_uuid() restricted to service_role only (prevents enumeration)';
  RAISE NOTICE '2. get_is_admin() available to authenticated users only (self-check)';
  RAISE NOTICE '3. Profiles: Users can UPDATE own profile';
  RAISE NOTICE '4. tpc_invoices: No direct INSERT/UPDATE for users (RPC only)';
  RAISE NOTICE '5. admin_whitelist: No SELECT for regular users (prevents enumeration)';
  RAISE NOTICE '6. get_invoice_public() available to anon + authenticated (safe)';
  RAISE NOTICE '======================================';
END $$;
