-- Fix Username Availability Check - Public Safe RPC
-- This replaces direct profiles table queries during signup

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.check_username_available(text);

-- Create public-safe username availability check
CREATE OR REPLACE FUNCTION public.check_username_available(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE exists_user boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE lower(username) = lower(p_username)
  ) INTO exists_user;
  RETURN NOT exists_user;
END;
$$;

-- Grant execute permissions to public and authenticated users
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;

-- Create invitation code validation RPC (public safe)
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE is_valid boolean;
BEGIN
  -- TODO: Implement actual invitation validation logic
  -- For now, return true for testing
  -- In production, check against invitations table
  SELECT true INTO is_valid;
  RETURN is_valid;
END;
$$;

-- Grant execute permissions for invitation validation
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO anon, authenticated;
