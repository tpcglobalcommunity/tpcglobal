-- Fix public invoice RPCs for anon-safe operation
-- Ensure get_invoice_public and submit_invoice_confirmation work correctly

BEGIN;

-- A) Ensure status constraint supports PENDING_REVIEW
ALTER TABLE public.tpc_invoices 
  DROP CONSTRAINT IF EXISTS tpc_invoices_status_check;

ALTER TABLE public.tpc_invoices 
  ADD CONSTRAINT tpc_invoices_status_check 
  CHECK (status IN ('UNPAID', 'PENDING_REVIEW', 'PAID', 'REJECTED', 'EXPIRED'));

-- B) Ensure invoice_confirmations.user_id is nullable for anon support
ALTER TABLE public.invoice_confirmations 
  ALTER COLUMN user_id DROP NOT NULL;

-- C) Drop all overloads safely with explicit alias
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname='public' AND p.proname='get_invoice_public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s;', r.sig);
  END LOOP;
END $$;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace ns ON ns.oid = p.pronamespace
    WHERE ns.nspname='public' AND p.proname='submit_invoice_confirmation'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s;', r.sig);
  END LOOP;
END $$;

-- D) Create canonical get_invoice_public function
CREATE OR REPLACE FUNCTION public.get_invoice_public(p_invoice_no text)
RETURNS TABLE (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  unit_price_usd numeric,
  total_usd numeric,
  total_idr numeric,
  usd_idr_rate numeric,
  treasury_address text,
  status text,
  payment_method text,
  payer_name text,
  payer_ref text,
  tx_signature text,
  proof_url text,
  receiver_wallet text,
  created_at timestamptz,
  expires_at timestamptz,
  reviewed_at timestamptz,
  review_note text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Validate input
  IF p_invoice_no IS NULL OR p_invoice_no = '' THEN
    RAISE EXCEPTION 'Invoice number cannot be empty';
  END IF;

  -- Return invoice data (exclude buyer_email for privacy)
  SELECT 
    i.invoice_no,
    i.stage,
    i.tpc_amount,
    i.unit_price_usd,
    i.total_usd,
    i.total_idr,
    i.usd_idr_rate,
    i.treasury_address,
    i.status,
    i.payment_method,
    i.payer_name,
    i.payer_ref,
    i.tx_signature,
    i.proof_url,
    i.receiver_wallet,
    i.created_at,
    i.expires_at,
    i.reviewed_at,
    i.review_note
  FROM public.tpc_invoices i
  WHERE i.invoice_no = p_invoice_no;
$$;

-- E) Create canonical submit_invoice_confirmation function
CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
  p_invoice_no text,
  p_payment_method text,
  p_payer_name text,
  p_payer_ref text,
  p_tx_signature text,
  p_proof_url text
)
RETURNS TABLE (
  success boolean,
  invoice_no text,
  status text,
  payment_method text,
  confirmation_id bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_exists boolean;
  v_current_status text;
  v_confirmation_id bigint;
BEGIN
  -- Validate inputs
  IF p_invoice_no IS NULL OR p_invoice_no = '' THEN
    RAISE EXCEPTION 'Invoice number cannot be empty';
  END IF;
  
  IF p_payment_method NOT IN ('BANK', 'USDC', 'SOL') THEN
    RAISE EXCEPTION 'Invalid payment method: %s', p_payment_method;
  END IF;

  -- Check if invoice exists and get current status
  SELECT EXISTS(SELECT 1 FROM public.tpc_invoices WHERE invoice_no = p_invoice_no)
  INTO v_invoice_exists;
  
  IF NOT v_invoice_exists THEN
    RAISE EXCEPTION 'Invoice not found: %s', p_invoice_no;
  END IF;

  -- Get current status
  SELECT status INTO v_current_status 
  FROM public.tpc_invoices 
  WHERE invoice_no = p_invoice_no;

  -- Only allow confirmation for UNPAID invoices
  IF v_current_status NOT IN ('UNPAID') THEN
    RAISE EXCEPTION 'Invoice cannot be confirmed. Current status: %s', v_current_status;
  END IF;

  -- Insert confirmation log (anon-safe)
  INSERT INTO public.invoice_confirmations (
    invoice_no,
    user_id,
    payment_method,
    payer_name,
    payer_ref,
    tx_signature,
    proof_url,
    created_at
  ) VALUES (
    p_invoice_no,
    auth.uid(),
    p_payment_method,
    p_payer_name,
    p_payer_ref,
    p_tx_signature,
    p_proof_url,
    now()
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
    updated_at = now()
  WHERE invoice_no = p_invoice_no;

  -- Return success result
  RETURN QUERY SELECT 
    true as success,
    p_invoice_no as invoice_no,
    'PENDING_REVIEW' as status,
    p_payment_method as payment_method,
    v_confirmation_id as confirmation_id;
END;
$$;

-- F) Grant permissions
REVOKE ALL ON FUNCTION public.get_invoice_public(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO authenticated;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text) TO authenticated;

COMMIT;

-- Verification queries
SELECT p.oid::regprocedure
FROM pg_proc p 
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('get_invoice_public','submit_invoice_confirmation')
ORDER BY 1;
