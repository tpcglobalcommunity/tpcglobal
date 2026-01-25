-- Migration: Create vendor_applications table with RLS policies
-- File: supabase-migrations/20260201000000_vendor_applications.sql

-- 0) Extensions (if not exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Drop table if exists (for clean recreation)
DROP TABLE IF EXISTS public.vendor_applications CASCADE;

-- 2) Create table
CREATE TABLE public.vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  contact_email text,
  contact_whatsapp text,
  website text,
  category text,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS vendor_applications_user_id_idx ON public.vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS vendor_applications_status_idx ON public.vendor_applications(status);
CREATE INDEX IF NOT EXISTS vendor_applications_created_at_idx ON public.vendor_applications(created_at DESC);

-- 4) RLS (Row Level Security)
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- 5) Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Updated_at trigger
CREATE TRIGGER vendor_applications_set_updated_at
  BEFORE UPDATE ON public.vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7) RLS Policies

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "vendor_applications_insert_own" ON public.vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_select_own" ON public.vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_admin_select" ON public.vendor_applications;
DROP POLICY IF EXISTS "vendor_applications_admin_update" ON public.vendor_applications;

-- Policy: Members can insert their own applications
CREATE POLICY "vendor_applications_insert_own"
ON public.vendor_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Members can select their own applications
CREATE POLICY "vendor_applications_select_own"
ON public.vendor_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can select all applications (email domain based - temporary)
-- Replace with your actual admin email domains
CREATE POLICY "vendor_applications_admin_select"
ON public.vendor_applications
FOR SELECT
USING (
  -- TEMPORARY: Allow users with specific email domains
  -- Replace these domains with your actual admin domains
  auth.email() LIKE '%@tpcglobal.com' 
  OR auth.email() LIKE '%@admin.tpcglobal.com'
  OR auth.email() LIKE '%@yourdomain.com'
);

-- Policy: Admins can update all applications (email domain based - temporary)
CREATE POLICY "vendor_applications_admin_update"
ON public.vendor_applications
FOR UPDATE
USING (
  -- TEMPORARY: Allow users with specific email domains
  -- Replace these domains with your actual admin domains
  auth.email() LIKE '%@tpcglobal.com' 
  OR auth.email() LIKE '%@admin.tpcglobal.com'
  OR auth.email() LIKE '%@yourdomain.com'
)
WITH CHECK (
  -- TEMPORARY: Allow users with specific email domains
  -- Replace these domains with your actual admin domains
  auth.email() LIKE '%@tpcglobal.com' 
  OR auth.email() LIKE '%@admin.tpcglobal.com'
  OR auth.email() LIKE '%@yourdomain.com'
);

-- 8) Grant permissions
GRANT ALL ON public.vendor_applications TO authenticated;
GRANT SELECT ON public.vendor_applications TO anon;

-- 9) Success message
DO $$
BEGIN
  RAISE NOTICE '✅ vendor_applications table created successfully with RLS policies';
END
$$;
