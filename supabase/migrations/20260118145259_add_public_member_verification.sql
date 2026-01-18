/*
  # Add Public Member Verification Function

  1. Function
    - `verify_member(identifier text)`: Safe public lookup function
      - Accepts referral code OR username as input
      - Returns ONLY safe public fields (no email, no user id)
      - Returns NULL if not found
      - SECURITY DEFINER to bypass RLS for read-only public verification

  2. Return Type
    - username (text)
    - full_name (text)
    - role (text)
    - is_verified (boolean)
    - created_at (timestamptz)
    - avatar_url (text)
    - referral_code (text)

  3. Security
    - Read-only operation
    - No sensitive data exposed
    - No email or user ID returned
    - Returns NULL for not found (no error messages)
    - Public access enabled

  Important Notes:
    - This function allows public verification of membership status
    - Only returns data that is safe for public display
    - Used for verification page and member status checks
    - Rate limiting should be handled at application level if needed
*/

-- =====================================================
-- 1. CREATE RETURN TYPE FOR VERIFY_MEMBER
-- =====================================================

CREATE TYPE public.member_verification_result AS (
  username text,
  full_name text,
  role text,
  is_verified boolean,
  created_at timestamptz,
  avatar_url text,
  referral_code text
);

-- =====================================================
-- 2. CREATE VERIFY_MEMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.verify_member(identifier text)
RETURNS public.member_verification_result
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result public.member_verification_result;
  normalized_identifier text;
BEGIN
  -- Normalize input (trim whitespace, uppercase for referral codes)
  normalized_identifier := trim(identifier);
  
  -- If identifier looks like a referral code (starts with TPC-), uppercase it
  IF normalized_identifier ILIKE 'TPC-%' THEN
    normalized_identifier := upper(normalized_identifier);
  END IF;
  
  -- Look up by referral_code first (exact match)
  SELECT 
    p.username,
    p.full_name,
    p.role,
    p.is_verified,
    p.created_at,
    p.avatar_url,
    p.referral_code
  INTO result
  FROM profiles p
  WHERE p.referral_code = normalized_identifier;
  
  -- If not found by referral_code, try username (case-insensitive)
  IF NOT FOUND THEN
    SELECT 
      p.username,
      p.full_name,
      p.role,
      p.is_verified,
      p.created_at,
      p.avatar_url,
      p.referral_code
    INTO result
    FROM profiles p
    WHERE lower(p.username) = lower(normalized_identifier);
  END IF;
  
  -- Return result (NULL if not found)
  RETURN result;
END;
$$;

-- =====================================================
-- 3. GRANT PUBLIC ACCESS TO FUNCTION
-- =====================================================

-- Allow anonymous and authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.verify_member(text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_member(text) TO authenticated;

-- =====================================================
-- 4. ADD COMMENT FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.verify_member(text) IS 
'Safely verifies TPC member status by referral code or username. Returns only public-safe fields (no email, no user ID). Used for public verification page.';
