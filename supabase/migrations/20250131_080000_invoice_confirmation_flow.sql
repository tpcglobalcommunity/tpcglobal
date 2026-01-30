-- Invoice Confirmation Flow - Database Updates
-- Adds receiver_wallet field and confirmation RPC

-- Phase 1: Add missing columns to tpc_invoices
DO $$
BEGIN
    -- Add receiver_wallet field if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'receiver_wallet') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN receiver_wallet text NULL;
    END IF;
    
    -- Ensure status constraint includes all required states
    ALTER TABLE public.tpc_invoices DROP CONSTRAINT IF EXISTS tpc_invoices_status_check;
EXCEPTION WHEN undefined_object THEN
    -- Constraint doesn't exist, continue
END;

ALTER TABLE public.tpc_invoices 
ADD CONSTRAINT tpc_invoices_status_check 
CHECK (status IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
END $$;

-- Phase 2: Create confirmation log table (append-only)
CREATE TABLE IF NOT EXISTS public.invoice_confirmations (
    id bigserial PRIMARY KEY,
    invoice_no text NOT NULL,
    email text NULL,
    payment_method text NOT NULL,
    payer_name text NULL,
    payer_ref text NULL,
    tx_signature text NULL,
    proof_url text NULL,
    receiver_wallet text NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on invoice_confirmations
ALTER TABLE public.invoice_confirmations ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_confirmations
DROP POLICY IF EXISTS "Users can view own confirmations" ON public.invoice_confirmations;
CREATE POLICY "Users can view own confirmations" ON public.invoice_confirmations
  FOR SELECT USING (auth.uid()::text = (SELECT email FROM public.tpc_invoices WHERE invoice_no = invoice_confirmations.invoice_no LIMIT 1));

DROP POLICY IF EXISTS "Admins can view all confirmations" ON public.invoice_confirmations;
CREATE POLICY "Admins can view all confirmations" ON public.invoice_confirmations
  FOR SELECT USING (public.is_admin_uuid(auth.uid()));

-- Phase 3: Create submit_invoice_confirmation RPC
CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
    p_invoice_no text,
    p_email text DEFAULT NULL,
    p_payment_method text,
    p_payer_name text DEFAULT NULL,
    p_payer_ref text DEFAULT NULL,
    p_tx_signature text DEFAULT NULL,
    p_proof_url text DEFAULT NULL,
    p_receiver_wallet text DEFAULT NULL
)
RETURNS TABLE (
    invoice_no text,
    status text,
    payment_method text,
    payer_name text,
    payer_ref text,
    tx_signature text,
    proof_url text,
    receiver_wallet text,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_status text;
BEGIN
    -- Check if invoice exists
    SELECT status INTO v_status
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    IF v_status NOT IN ('UNPAID','REJECTED') THEN
        RAISE EXCEPTION 'Invoice not eligible for confirmation';
    END IF;

    -- Minimal validation
    IF p_payment_method IS NULL OR length(trim(p_payment_method)) = 0 THEN
        RAISE EXCEPTION 'Payment method required';
    END IF;

    -- Receiver wallet required (enforce here)
    IF p_receiver_wallet IS NULL OR length(trim(p_receiver_wallet)) < 32 THEN
        RAISE EXCEPTION 'Receiver wallet required';
    END IF;

    -- Log confirmation
    INSERT INTO public.invoice_confirmations (
        invoice_no, email, payment_method, payer_name, payer_ref, tx_signature, proof_url, receiver_wallet
    ) VALUES (
        p_invoice_no, p_email, p_payment_method, p_payer_name, p_payer_ref, p_tx_signature, p_proof_url, p_receiver_wallet
    );

    -- Update invoice
    UPDATE public.tpc_invoices
    SET
        status = 'PENDING_REVIEW',
        payment_method = p_payment_method,
        payer_name = p_payer_name,
        payer_ref = p_payer_ref,
        tx_signature = p_tx_signature,
        proof_url = p_proof_url,
        receiver_wallet = p_receiver_wallet,
        updated_at = now()
    WHERE invoice_no = p_invoice_no;

    RETURN QUERY
    SELECT
        p_invoice_no,
        'PENDING_REVIEW',
        p_payment_method,
        p_payer_name,
        p_payer_ref,
        p_tx_signature,
        p_proof_url,
        p_receiver_wallet,
        now();
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text, text, text) TO authenticated;
ALTER FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text, text, text) SET search_path = public;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Invoice Confirmation Flow Updated ===';
  RAISE NOTICE 'Added: receiver_wallet field to tpc_invoices';
  RAISE NOTICE 'Created: invoice_confirmations log table';
  RAISE NOTICE 'RPC: submit_invoice_confirmation (SECURITY DEFINER)';
  RAISE NOTICE 'Validation: payment_method + receiver_wallet required';
  RAISE NOTICE 'Workflow: UNPAID/REJECTED -> PENDING_REVIEW';
END $$;
