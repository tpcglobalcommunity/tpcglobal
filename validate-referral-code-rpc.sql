-- Validate Referral Code RPC Function
-- Public function to validate referral codes without authentication

-- Drop existing function to ensure clean slate
DROP FUNCTION IF EXISTS public.validate_referral_code_public(text) CASCADE;

-- Create public referral code validation function
CREATE FUNCTION public.validate_referral_code_public(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    code_exists BOOLEAN := false;
BEGIN
    -- Check if referral code exists in profiles table
    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE referral_code = p_code 
          AND referral_code IS NOT NULL 
          AND referral_code != ''
          AND referral_code != 'REFERRAL_CODE_NOT_AVAILABLE'
    ) INTO code_exists;
    
    RETURN code_exists;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.validate_referral_code_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO anon;

-- Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verification
SELECT 'validate_referral_code_public function created' AS status;

-- Test function
SELECT validate_referral_code_public('TPC-TEST123') AS test_result;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'validate_referral_code_public';
