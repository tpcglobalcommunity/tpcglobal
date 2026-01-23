-- Migration: Template for safe function creation
-- Author: AI Assistant
-- Date: 2026-01-23
-- Dependencies: None
-- Type: Function
-- Reversible: Yes
-- Impact: Low

-- UP MIGRATION
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE upper(trim(referral_code)) = upper(trim(p_code))
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text)
TO anon, authenticated;

-- DOWN MIGRATION
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Revert to stub function (returns false for all inputs)
  RETURN false;
END;
$$;

-- Revoke execute permissions (optional - can keep if function still needed)
-- REVOKE EXECUTE ON FUNCTION public.validate_referral_code_public(text) FROM anon;
-- REVOKE EXECUTE ON FUNCTION public.validate_referral_code_public(text) FROM authenticated;
