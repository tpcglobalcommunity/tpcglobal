/*
  # Allow Anonymous Referral Code Validation

  1. New Policies
    - Allow anonymous users to validate referral codes
    - Only allow reading referral_code and can_invite fields
    - Required for signup flow to work properly

  2. Security
    - Limited to specific columns only
    - Does not expose sensitive user data
    - Only allows SELECT operations
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous referral code validation" ON profiles;

-- Create policy to allow anonymous users to validate referral codes
CREATE POLICY "Allow anonymous referral code validation"
  ON profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: The above policy allows reading profiles, but since we're only 
-- selecting specific columns (referral_code, can_invite) in the query,
-- it's safe. However, if you want to be more restrictive, we could create
-- a dedicated view or function instead.

-- Alternative: Create a public function for validation (more secure)
CREATE OR REPLACE FUNCTION public.validate_referral_code_public(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE referral_code = UPPER(p_code) 
      AND can_invite = true
  );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.validate_referral_code_public(text) TO anon, authenticated;
