-- Submit Payment Confirmation RPC
-- Security DEFINER RPC for submitting payment confirmations

CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
    p_invoice_no text,
    p_payment_method text,
    p_payer_name text DEFAULT NULL,
    p_payer_ref text DEFAULT NULL,
    p_tx_signature text DEFAULT NULL,
    p_proof_url text DEFAULT NULL,
    p_email text DEFAULT NULL
)
RETURNS TABLE (
    invoice_no text,
    status text,
    payment_method text,
    payer_name text,
    payer_ref text,
    tx_signature text,
    proof_url text,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invoice_exists boolean;
    v_current_status text;
    v_user_id uuid;
BEGIN
    -- Check if invoice exists
    SELECT EXISTS(
        SELECT 1 FROM public.tpc_invoices 
        WHERE invoice_no = p_invoice_no
    ) INTO v_invoice_exists;
    
    IF NOT v_invoice_exists THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_no;
    END IF;
    
    -- Get current status
    SELECT status INTO v_current_status
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no;
    
    -- Allow submission if UNPAID or REJECTED (resubmit)
    IF v_current_status NOT IN ('UNPAID', 'REJECTED') THEN
        RAISE EXCEPTION 'Invoice cannot be confirmed. Current status: %', v_current_status;
    END IF;
    
    -- Get user ID (null for anon)
    v_user_id := auth.uid();
    
    -- Log confirmation in append-only table
    INSERT INTO public.invoice_confirmations (
        invoice_no,
        user_id,
        email,
        payment_method,
        payer_name,
        payer_ref,
        tx_signature,
        proof_url
    ) VALUES (
        p_invoice_no,
        v_user_id,
        p_email,
        p_payment_method,
        p_payer_name,
        p_payer_ref,
        p_tx_signature,
        p_proof_url
    );
    
    -- Update invoice status and details
    UPDATE public.tpc_invoices
    SET 
        status = 'PENDING_REVIEW',
        payment_method = p_payment_method,
        payer_name = p_payer_name,
        payer_ref = p_payer_ref,
        tx_signature = p_tx_signature,
        proof_url = p_proof_url,
        updated_at = now()
    WHERE invoice_no = p_invoice_no;
    
    -- Return updated invoice data
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.status,
        i.payment_method,
        i.payer_name,
        i.payer_ref,
        i.tx_signature,
        i.proof_url,
        i.updated_at
    FROM public.tpc_invoices i
    WHERE i.invoice_no = p_invoice_no;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
    text, text, text, text, text, text, text
) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
    text, text, text, text, text, text, text
) TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Submit Payment Confirmation RPC Created ===';
  RAISE NOTICE 'Function: submit_invoice_confirmation';
  RAISE NOTICE 'Validates: invoice exists, status allows confirmation';
  RAISE NOTICE 'Logs: append-only invoice_confirmations table';
  RAISE NOTICE 'Updates: invoice status to PENDING_REVIEW';
  RAISE NOTICE 'Permissions: anon and authenticated';
END $$;
