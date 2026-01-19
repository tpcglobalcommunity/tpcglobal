/*
  # Fix Referral Code Validation Permissions

  1. Changes
    - Ensure anonymous users can execute the validation function
    - Add proper grants for public schema
    - Verify function security settings

  2. Security
    - Function is read-only
    - Only returns boolean
    - No sensitive data exposed
*/

-- Recreate function with proper permissions
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Check if referral code exists and can invite
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE referral_code = UPPER(TRIM(p_code))
      AND can_invite = true
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error
    RETURN false;
END;
$$;

-- Revoke all first
REVOKE ALL ON FUNCTION public.validate_referral_code_public(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_referral_code_public(text) FROM anon;
REVOKE ALL ON FUNCTION public.validate_referral_code_public(text) FROM authenticated;

-- Grant execute to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_referral_code_public(text) IS 
'Validates if a referral code is valid and can be used for signup. Available to anonymous users.';
