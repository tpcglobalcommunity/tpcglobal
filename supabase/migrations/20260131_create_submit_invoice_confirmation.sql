-- Create submit_invoice_confirmation RPC function
-- This handles payment confirmation submissions from users

BEGIN;

-- Drop any existing overloads to avoid signature mismatch
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'submit_invoice_confirmation'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s;', r.sig);
  END LOOP;
END $$;

-- Create invoice_confirmations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invoice_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_no text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_method text NOT NULL,
  payer_name text,
  payer_ref text,
  tx_signature text,
  proof_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_invoice_confirmations_invoice 
    FOREIGN KEY (invoice_no) REFERENCES public.tpc_invoices(invoice_no)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_confirmations_invoice_no 
  ON public.invoice_confirmations(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoice_confirmations_user_id 
  ON public.invoice_confirmations(user_id);

-- Ensure tpc_invoices has required columns
ALTER TABLE public.tpc_invoices 
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payer_name text,
  ADD COLUMN IF NOT EXISTS payer_ref text,
  ADD COLUMN IF NOT EXISTS tx_signature text,
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_note text;

-- Create canonical submit_invoice_confirmation function
CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
  p_invoice_no text,
  p_payment_method text,
  p_payer_name text,
  p_payer_ref text,
  p_tx_signature text,
  p_proof_url text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_record public.tpc_invoices%ROWTYPE;
  v_confirmation_id uuid;
  v_result json;
BEGIN
  -- Validate payment method
  IF p_payment_method NOT IN ('BANK', 'USDC', 'SOL') THEN
    RAISE EXCEPTION 'Invalid payment method: %s', p_payment_method;
  END IF;

  -- Check if invoice exists
  SELECT * INTO v_invoice_record 
  FROM public.tpc_invoices 
  WHERE invoice_no = p_invoice_no;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found: %s', p_invoice_no;
  END IF;

  -- Check invoice status (allow UNPAID or PENDING_REVIEW)
  IF v_invoice_record.status NOT IN ('UNPAID', 'PENDING_REVIEW') THEN
    RAISE EXCEPTION 'Invoice cannot be confirmed. Current status: %s', v_invoice_record.status;
  END IF;

  -- Insert confirmation record
  INSERT INTO public.invoice_confirmations (
    invoice_no,
    user_id,
    payment_method,
    payer_name,
    payer_ref,
    tx_signature,
    proof_url
  ) VALUES (
    p_invoice_no,
    auth.uid(),
    p_payment_method,
    p_payer_name,
    p_payer_ref,
    p_tx_signature,
    p_proof_url
  ) RETURNING id INTO v_confirmation_id;

  -- Update invoice status and details
  UPDATE public.tpc_invoices 
  SET 
    status = 'PENDING_REVIEW',
    payment_method = p_payment_method,
    payer_name = p_payer_name,
    payer_ref = p_payer_ref,
    tx_signature = p_tx_signature,
    proof_url = p_proof_url,
    reviewed_by = NULL,
    reviewed_at = NULL,
    review_note = NULL
  WHERE invoice_no = p_invoice_no;

  -- Return success result
  v_result := json_build_object(
    'success', true,
    'invoice_no', p_invoice_no,
    'status', 'PENDING_REVIEW',
    'payment_method', p_payment_method,
    'confirmation_id', v_confirmation_id
  );

  RETURN v_result;
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text
) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text
) TO authenticated;

COMMIT;

-- Verify function exists
SELECT p.oid::regprocedure
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='submit_invoice_confirmation';
