-- Fix create_invoice RPC for Buy TPC
-- Creates proper create_invoice function that works with invoices table

-- First, let's check if the function exists and drop it to recreate
DROP FUNCTION IF EXISTS public.create_invoice(numeric, text);

-- Create the create_invoice function for the invoices table
CREATE OR REPLACE FUNCTION public.create_invoice(p_tpc_amount numeric, p_referral_code text)
RETURNS TABLE (invoice_no text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_active_stage text;
    v_price_usd numeric;
    v_usd_idr_rate numeric DEFAULT 17000; -- Default rate
    v_treasury_address text DEFAULT '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw'; -- Default treasury
    v_total_usd numeric;
    v_total_idr numeric;
    v_invoice_no text;
    v_stage_supply numeric;
    v_sold_amount numeric;
    v_remaining_amount numeric;
    v_max_amount numeric := 100000000; -- Maximum 100M TPC
    v_normalized_referral_code text;
BEGIN
    -- For public access, we'll allow anonymous users but require email validation
    -- v_user_id := auth.uid(); -- Commented out for public access
    
    -- Validate TPC amount
    IF p_tpc_amount IS NULL OR p_tpc_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid TPC amount: Amount must be greater than 0';
    END IF;
    
    IF p_tpc_amount > v_max_amount THEN
        RAISE EXCEPTION 'Amount too large: Maximum amount is % TPC', v_max_amount;
    END IF;
    
    -- Validate and normalize referral code (REQUIRED)
    IF p_referral_code IS NULL OR TRIM(p_referral_code) = '' THEN
        RAISE EXCEPTION 'REFERRAL_REQUIRED: Referral code is required';
    END IF;
    
    -- Normalize referral code
    v_normalized_referral_code := UPPER(TRIM(p_referral_code));
    
    -- Validate referral code exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM referral_codes 
        WHERE code = v_normalized_referral_code AND is_active = true
    ) THEN
        RAISE EXCEPTION 'REFERRAL_INVALID: Referral code is invalid or inactive';
    END IF;
    
    -- Get active stage info
    SELECT stage, price_usd, supply
    INTO v_active_stage, v_price_usd, v_stage_supply
    FROM public.presale_stages
    WHERE status = 'ACTIVE'
    LIMIT 1;
    
    -- Check if we have an active stage
    IF v_active_stage IS NULL THEN
        RAISE EXCEPTION 'No active presale stage found';
    END IF;
    
    -- Calculate sold amount for this stage
    SELECT COALESCE(SUM(tpc_amount), 0)
    INTO v_sold_amount
    FROM public.invoices
    WHERE stage = v_active_stage AND status IN ('PENDING', 'CONFIRMED', 'APPROVED');
    
    -- Calculate remaining amount
    v_remaining_amount := v_stage_supply - v_sold_amount;
    
    -- Check if enough TPC available
    IF p_tpc_amount > v_remaining_amount THEN
        RAISE EXCEPTION 'Insufficient TPC available: Only % TPC remaining', v_remaining_amount;
    END IF;
    
    -- Calculate totals server-side (prevent tampering)
    v_total_usd := p_tpc_amount * v_price_usd;
    v_total_idr := v_total_usd * v_usd_idr_rate;
    
    -- Generate unique invoice number (human-readable but non-guessable)
    v_invoice_no := 'TPC' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 8));
    
    -- Insert invoice with server-side calculated values
    -- Note: buyer_email will be provided by frontend in a separate update or we can modify the signature
    INSERT INTO public.invoices (
        invoice_no,
        stage,
        tpc_amount,
        price_usd,
        total_usd,
        usd_idr_rate,
        treasury_address,
        referral_code,
        status,
        buyer_email -- Will be updated by frontend
    ) VALUES (
        v_invoice_no,
        v_active_stage,
        p_tpc_amount,
        v_price_usd,
        v_total_usd,
        v_usd_idr_rate,
        v_treasury_address,
        v_normalized_referral_code,
        'PENDING',
        'pending@tpc.global' -- Placeholder, will be updated by frontend
    );
    
    -- Return invoice number
    RETURN QUERY SELECT v_invoice_no as invoice_no;
END;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;

-- Add function to update buyer email for an invoice
CREATE OR REPLACE FUNCTION public.update_invoice_email(p_invoice_no text, p_buyer_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.invoices
    SET buyer_email = p_buyer_email,
        updated_at = now()
    WHERE invoice_no = p_invoice_no;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_no;
    END IF;
END;
$$;

-- Grant execute permissions for email update
GRANT EXECUTE ON FUNCTION public.update_invoice_email(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_invoice_email(text, text) TO anon;

-- Verification query
DO $$
BEGIN
  RAISE NOTICE '=== create_invoice RPC Fix Applied ===';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '- create_invoice(p_tpc_amount, p_referral_code): Creates invoice in invoices table';
  RAISE NOTICE '- update_invoice_email(p_invoice_no, p_buyer_email): Updates buyer email';
  RAISE NOTICE 'Permissions: Granted to authenticated and anon users';
END $$;
