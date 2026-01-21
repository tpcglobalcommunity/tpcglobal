-- Fix RLS Policies for Admin Access
-- Run this in Supabase SQL Editor

-- Enable RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT
USING (id = auth.uid());

-- Policy: Admin users can view all profiles
DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
FOR SELECT
USING (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Policy: Admin users can update any profile
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
FOR UPDATE
USING (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy: Admin users can insert any profile
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;
CREATE POLICY "profiles_admin_insert" ON public.profiles
FOR INSERT
WITH CHECK (id IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- Check admin users
SELECT id, email, role 
FROM public.profiles 
WHERE role IN ('admin', 'super_admin');

-- Check specific admin profile
SELECT
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.verified
FROM public.profiles p
WHERE p.email = 'tpcglobal.io@gmail.com';
