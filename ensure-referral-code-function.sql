-- D) ENSURE REFERRAL CODE FUNCTION - ON-DEMAND GENERATION
-- Creates helper function to generate unique referral codes with collision detection

BEGIN;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.ensure_referral_code() CASCADE;

-- Create function to ensure referral code exists
CREATE FUNCTION public.ensure_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    my_uid UUID := auth.uid();
    my_current_code TEXT;
    new_code TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
    collision_detected BOOLEAN;
BEGIN
    -- Safety check: ensure user is authenticated
    IF my_uid IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get current referral code
    SELECT referral_code INTO my_current_code
    FROM public.profiles
    WHERE id = my_uid;

    -- If code already exists and is valid, return it
    IF my_current_code IS NOT NULL AND my_current_code != '' AND my_current_code != 'REFERRAL_CODE_NOT_AVAILABLE' THEN
        RETURN my_current_code;
    END IF;

    -- Generate unique code with collision detection
    WHILE attempt < max_attempts LOOP
        attempt := attempt + 1;
        
        -- Generate new code: TPC- + 6 random hex chars
        new_code := 'TPC-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 6));
        
        -- Check for collision
        SELECT EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE referral_code = new_code
        ) INTO collision_detected;
        
        -- If no collision, use this code
        IF NOT collision_detected THEN
            -- Update the user's profile
            UPDATE public.profiles
            SET referral_code = new_code
            WHERE id = my_uid;
            
            RETURN new_code;
        END IF;
    END LOOP;
    
    -- If we reach here, all attempts had collisions (very unlikely)
    RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', max_attempts;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.ensure_referral_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_referral_code() TO authenticated;

COMMIT;

-- Test the function (this will return empty if no authenticated context)
SELECT 'Testing ensure_referral_code function:' AS test_info;
SELECT * FROM public.ensure_referral_code() LIMIT 1;

-- Verification query
SELECT 'Function ensure_referral_code created successfully' AS status;
