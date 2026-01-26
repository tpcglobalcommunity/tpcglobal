-- FINAL LOCK RLS PROFILES - Fix 403 on profiles upsert
-- Execute this entire script in Supabase SQL Editor

-- =========================================================
-- A) ENABLE RLS
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- B) CREATE OR REPLACE HELPER FUNCTION
-- =========================================================

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
-- D) CREATE EXACT POLICIES
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
-- E) VALIDATION
-- =========================================================

-- Test function
SELECT public.is_admin();

-- Test policies
SELECT COUNT(*) as my_profile FROM public.profiles WHERE id = auth.uid();

COMMIT;
