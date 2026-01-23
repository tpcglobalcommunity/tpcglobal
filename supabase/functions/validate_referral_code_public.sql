-- Function: Referral Code Validation
-- Purpose: Validate referral codes for user signup
-- Author: AI Assistant
-- Date: 2026-01-23
-- Version: 1.0.0

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

-- Grant execute permissions for public access
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text)
TO anon, authenticated;

-- Add function comment for documentation
COMMENT ON FUNCTION public.validate_referral_code_public(text) IS 'Validates referral codes for public signup - case-insensitive check against existing profiles';
