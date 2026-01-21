-- Generate Referral Code Public RPC Function
-- Public function to generate unique referral codes with collision detection

-- Drop existing function to ensure clean slate
DROP FUNCTION IF EXISTS public.generate_referral_code_public(text, integer) CASCADE;

-- Create public referral code generation function
CREATE FUNCTION public.generate_referral_code_public(
    p_prefix TEXT DEFAULT 'TPC',
    p_max_uses INTEGER DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN := true;
    attempts INTEGER := 0;
    max_attempts INTEGER := 10;
    random_suffix TEXT;
BEGIN
    -- Validate prefix
    IF p_prefix IS NULL OR p_prefix = '' THEN
        p_prefix := 'TPC';
    END IF;
    
    -- Generate unique code with collision detection
    WHILE code_exists AND attempts < max_attempts LOOP
        attempts := attempts + 1;
        
        -- Generate random suffix (8 characters)
        random_suffix := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8));
        new_code := p_prefix || '-' || random_suffix;
        
        -- Check if code already exists
        SELECT EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE referral_code = new_code
        ) INTO code_exists;
        
        -- Exit loop if we found unique code
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    -- If we couldn't generate unique code after max attempts, raise error
    IF code_exists THEN
        RAISE EXCEPTION 'Unable to generate unique referral code after % attempts', max_attempts;
    END IF;
    
    -- Optional: Store code usage limit if p_max_uses is provided
    -- This would require a separate table for tracking code usage
    -- For now, just return the generated code
    
    RETURN new_code;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.generate_referral_code_public(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_referral_code_public(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_referral_code_public(text, integer) TO anon;

-- Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verification
SELECT 'generate_referral_code_public function created' AS status;

-- Test function
SELECT generate_referral_code_public('TPC', 50) AS test_code;

-- Test multiple times to check uniqueness
SELECT generate_referral_code_public('TPC', 50) AS test_code_2;
SELECT generate_referral_code_public('TPC', 50) AS test_code_3;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'generate_referral_code_public';

-- Optional: Create table for tracking code usage limits (uncomment if needed)
/*
CREATE TABLE IF NOT EXISTS public.referral_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referral_code)
);

-- Function to check and update usage
CREATE OR REPLACE FUNCTION public.check_referral_code_usage(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    max_uses_val INTEGER;
    current_uses_val INTEGER;
BEGIN
    SELECT max_uses, current_uses 
    INTO max_uses_val, current_uses_val
    FROM public.referral_code_usage 
    WHERE referral_code = p_code;
    
    -- Return true if no limit or under limit
    RETURN max_uses_val IS NULL OR current_uses_val < max_uses_val;
END;
$$;
*/
