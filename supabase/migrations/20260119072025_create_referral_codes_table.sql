/*
  # Create Referral Codes System

  1. New Tables
    - `referral_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The referral code itself
      - `is_active` (boolean) - Whether the code is currently valid
      - `max_uses` (integer, nullable) - Maximum number of uses (null = unlimited)
      - `used_count` (integer) - Current number of uses
      - `created_by` (uuid, nullable) - Who created this code
      - `created_at` (timestamptz) - When the code was created

  2. Security
    - Enable RLS on `referral_codes` table
    - Revoke direct table access from anon and authenticated
    - Grant execute permission on validation function to anon and authenticated

  3. Functions
    - `validate_referral_code(p_code text)` - Validates if a referral code is active and not exhausted

  4. Initial Data
    - Seed `TPC-BOOT01` as bootstrap referral code
*/

-- 1) Create table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- 3) Seed bootstrap code (idempotent)
INSERT INTO public.referral_codes (code, is_active, max_uses)
VALUES ('TPC-BOOT01', true, null)
ON CONFLICT (code) DO UPDATE
SET is_active = excluded.is_active;

-- 4) Create validation function
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.referral_codes rc
    WHERE rc.code = UPPER(TRIM(p_code))
      AND rc.is_active = true
      AND (rc.max_uses IS NULL OR rc.used_count < rc.max_uses)
  );
$$;

-- 5) Lock down table access
REVOKE ALL ON TABLE public.referral_codes FROM anon, authenticated;

-- 6) Grant execute on function
GRANT EXECUTE ON FUNCTION public.validate_referral_code(text) TO anon, authenticated;
