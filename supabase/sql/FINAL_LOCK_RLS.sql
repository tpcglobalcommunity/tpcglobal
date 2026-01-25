-- FINAL LOCK RLS POLICIES FOR ADMIN + MEMBER SECURITY
-- This script provides Row Level Security policies for:
-- 1. profiles table - admin access control
-- 2. vendor_applications table - admin and user access control  
-- 3. marketplace_items table - admin only access control

-- =========================================================
-- 1) HELPER FUNCTION: ADMIN CHECK
-- =========================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND verified = true
  );
END;
$$;

-- =========================================================
-- 2) PROFILES TABLE RLS POLICIES
-- =========================================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IFICY "profiles_insert_own" ON profiles;

-- Policy: Users can select their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy: Admins can select all profiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Users can update their own profile (except role and verified fields)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    -- Allow updating most fields but protect critical ones
    role = (SELECT role FROM profiles WHERE id = auth.uid()),
    verified = (SELECT verified FROM profiles WHERE id = auth.uid())
  );

-- Policy: Admins can update any profile
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Policy: Allow users to insert their own profile (usually via signup trigger)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid(),
    user_id = auth.uid()
  );

-- =========================================================
-- 3) VENDOR_APPLICATIONS TABLE RLS POLICIES
-- =========================================================

-- Enable RLS on vendor_applications
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "vendor_applications_select_own" ON vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_select_admin" ON vendor_applications;
DROP POLICY EXISTS "vendor_applications_update_admin" ON vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_insert_user" ON vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_delete_admin" ON vendor_applications;

-- Policy: Users can select their own applications
CREATE POLICY "vendor_applications_select_own" ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Admins can select all applications
CREATE POLICY "vendor_applications_select_admin" ON vendor_applications
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can update applications (approve/reject + admin_note)
CREATE POLICY "vendor_applications_update_admin" ON vendor_applications
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Policy: Users can insert their own applications
CREATE POLICY "vendor_applications_insert_user" ON vendor_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Policy: Only admins can delete applications
CREATE POLICY "vendor_applications_delete_admin" ON vendor_applications
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- =========================================================
-- 4) MARKETPLACE_ITEMS TABLE RLS POLICIES
-- =========================================================

-- Enable RLS on marketplace_items
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "marketplace_items_select_public" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_items_select_auth" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_select_vendor" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_select_admin" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_insert_vendor" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_update_admin" ON marketplace_items;
DROP POLICY IF EXISTS "marketplace_delete_admin" ON marketplace_items;

-- Policy: Public users can select only published items
CREATE POLICY "marketplace_items_select_public" ON marketplace_items
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Policy: Authenticated users can select published items
CREATE POLICY "marketplace_items_select_auth" ON marketplace_items
  FOR SELECT
  TO authenticated
  USING (status = 'published' OR is_admin());

-- Policy: Vendors can select their own items (optional - uncomment if needed)
-- CREATE POLICY "marketplace_select_vendor" ON marketplace_items
--   FOR SELECT
--   TO authenticated
--   USING (vendor_user_id = auth.uid() OR is_admin());

-- Policy: Admins can select all items
CREATE POLICY "marketplace_items_select_admin" ON marketplace_items
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can insert items
CREATE POLICY "marketplace_insert_admin" ON marketplace_items
  FOR INSERT
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can update items
CREATE POLICY "marketplace_update_admin" ON marketplace_items
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Policy: Only admins can delete items
CREATE POLICY "marketplace_delete_admin" ON marketplace_items
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- =========================================================
-- 5. REVOKE EXECUTE ON PUBLIC FOR SECURITY
-- =========================================================

REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_admin() FROM authenticated;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =========================================================
-- 6. INDEXES FOR PERFORMANCE (if not already exist)
-- =========================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_verified ON profiles(role, verified);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_published_at ON marketplace_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_vendor_user ON marketplace_items(vendor_user_id);

-- =========================================================
-- 7. VALIDATION
-- =========================================================

-- Test the function
SELECT is_admin();

-- Test policies (these should return data when run as admin, empty otherwise)
SELECT COUNT(*) as admin_profiles FROM profiles WHERE is_admin();
SELECT COUNT(*) as all_vendor_applications FROM vendor_applications;
SELECT COUNT(*) as published_marketplace_items FROM marketplace_items WHERE status = 'published';

COMMIT;
