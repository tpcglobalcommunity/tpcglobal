-- FINAL LOCK COMPLETE DATABASE FIX
-- Execute this entire script in Supabase SQL Editor

-- =========================================================
-- A) ENABLE RLS
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- B) CREATE OR REPLACE HELPER FUNCTIONS
-- =========================================================

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Unified access function (SINGLE SOURCE OF TRUTH)
CREATE OR REPLACE FUNCTION public.get_my_access()
RETURNS TABLE(role text, verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select
    coalesce(p.role, 'member') as role,
    coalesce(p.verified, false) as verified
  from public.profiles p
  where p.id = auth.uid()
  union all
  select 'member'::text, false::boolean
  where not exists (select 1 from public.profiles where id = auth.uid());
$$;

-- =========================================================
-- C) CLEANLY DROP EXISTING CONFLICTING POLICIES
-- =========================================================

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

-- =========================================================
-- D) CREATE EXACT PROFILES POLICIES
-- =========================================================

-- 1) SELECT policy: profiles_select_own_or_admin
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- 2) INSERT policy: profiles_insert_own
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
  );

-- 3) UPDATE policy: profiles_update_own_or_admin
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    id = auth.uid() OR public.is_admin()
  );

-- =========================================================
-- E) GRANT FUNCTION PERMISSIONS
-- =========================================================

REVOKE ALL ON FUNCTION public.get_my_access() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_access() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_access() TO authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =========================================================
-- F) VALIDATION
-- =========================================================

-- Test functions
SELECT public.is_admin();
SELECT public.get_my_access();

-- Test policies
SELECT COUNT(*) as my_profile FROM public.profiles WHERE id = auth.uid();

COMMIT;
