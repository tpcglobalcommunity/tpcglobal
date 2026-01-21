-- Referral Claim & Record RPC Functions
-- Public functions for claiming referral codes and recording referrals after signup

-- Drop existing functions to ensure clean slate
DROP FUNCTION IF EXISTS public.claim_referral_code_public(text) CASCADE;
DROP FUNCTION IF EXISTS public.record_referral_after_signup_public(uuid, text) CASCADE;

-- Function 1: Claim referral code (mark as used if needed)
CREATE FUNCTION public.claim_referral_code_public(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    code_exists BOOLEAN := false;
    referrer_id UUID;
BEGIN
    -- Check if referral code exists and get referrer_id
    SELECT id, EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE referral_code = p_code 
          AND referral_code IS NOT NULL 
          AND referral_code != ''
          AND referral_code != 'REFERRAL_CODE_NOT_AVAILABLE'
    ) INTO referrer_id, code_exists;
    
    -- Return false if code doesn't exist
    IF NOT code_exists THEN
        RETURN false;
    END IF;
    
    -- Here you could add logic to mark the code as used
    -- For now, just return true to indicate the code is valid
    RETURN true;
END;
$$;

-- Function 2: Record referral after successful signup
CREATE FUNCTION public.record_referral_after_signup_public(
    p_child_user_id UUID,
    p_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    referrer_id UUID;
    code_exists BOOLEAN := false;
    referral_recorded BOOLEAN := false;
    referral_table_name TEXT;
BEGIN
    -- Check if referral code exists and get referrer_id
    SELECT id, EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE referral_code = p_code 
          AND referral_code IS NOT NULL 
          AND referral_code != ''
          AND referral_code != 'REFERRAL_CODE_NOT_AVAILABLE'
    ) INTO referrer_id, code_exists;
    
    -- Return false if code doesn't exist
    IF NOT code_exists THEN
        RETURN false;
    END IF;
    
    -- Auto-detect referral tracking table
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='referrals'
    ) THEN
        referral_table_name := 'referrals';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='invites'
    ) THEN
        referral_table_name := 'invites';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='referral_events'
    ) THEN
        referral_table_name := 'referral_events';
    ELSE
        -- No referral tracking table, update profiles directly
        UPDATE public.profiles 
        SET referred_by = referrer_id,
            referred_by_code = p_code
        WHERE id = p_child_user_id;
        
        RETURN true;
    END IF;
    
    -- Record referral in the detected table
    IF referral_table_name = 'referrals' THEN
        INSERT INTO public.referrals (
            referrer_id, 
            referred_user_id, 
            referral_code,
            created_at
        ) VALUES (
            referrer_id,
            p_child_user_id,
            p_code,
            NOW()
        );
        
        referral_recorded := true;
        
    ELSIF referral_table_name = 'invites' THEN
        INSERT INTO public.invites (
            inviter_id, 
            invited_user_id, 
            referral_code,
            created_at
        ) VALUES (
            referrer_id,
            p_child_user_id,
            p_code,
            NOW()
        );
        
        referral_recorded := true;
        
    ELSIF referral_table_name = 'referral_events' THEN
        INSERT INTO public.referral_events (
            referrer_id, 
            referred_user_id, 
            referral_code,
            created_at
        ) VALUES (
            referrer_id,
            p_child_user_id,
            p_code,
            NOW()
        );
        
        referral_recorded := true;
    END IF;
    
    -- Also update the child's profile with referral info
    UPDATE public.profiles 
    SET referred_by = referrer_id,
        referred_by_code = p_code
    WHERE id = p_child_user_id;
    
    RETURN referral_recorded;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.claim_referral_code_public(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_referral_code_public(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_code_public(text) TO anon;

REVOKE ALL ON FUNCTION public.record_referral_after_signup_public(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_referral_after_signup_public(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_referral_after_signup_public(uuid, text) TO anon;

-- Reload PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verification
SELECT 'Referral claim and record functions created' AS status;

-- Test functions
SELECT claim_referral_code_public('TPC-TEST123') AS claim_test;

-- Check function registration
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname IN ('claim_referral_code_public', 'record_referral_after_signup_public')
ORDER BY proname;
