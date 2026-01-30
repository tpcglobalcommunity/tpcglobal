-- ============================================================
-- FIX: submit_invoice_confirmation parameter order
-- Move optional params (with defaults) AFTER required params
-- ============================================================

DROP FUNCTION IF EXISTS public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
);

CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
  p_invoice_no text,
  p_payment_method text,
  p_receiver_wallet text,
  p_email text DEFAULT NULL,
  p_payer_name text DEFAULT NULL,
  p_payer_ref text DEFAULT NULL,
  p_tx_signature text DEFAULT NULL,
  p_proof_url text DEFAULT NULL
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
  v_invoice_email text;
  v_email_col text;
BEGIN
  -- Detect email column name (supports email or buyer_email)
  SELECT c.column_name
    INTO v_email_col
  FROM information_schema.columns c
  WHERE c.table_schema='public'
    AND c.table_name='tpc_invoices'
    AND c.column_name IN ('email','buyer_email')
  ORDER BY CASE c.column_name WHEN 'email' THEN 1 ELSE 2 END
  LIMIT 1;

  -- Fetch invoice status (+ email if column exists)
  IF v_email_col IS NULL THEN
    SELECT i.status
      INTO v_status
    FROM public.tpc_invoices i
    WHERE i.invoice_no = p_invoice_no
    LIMIT 1;
    v_invoice_email := NULL;
  ELSE
    EXECUTE format('SELECT i.status, i.%I FROM public.tpc_invoices i WHERE i.invoice_no = $1 LIMIT 1', v_email_col)
      INTO v_status, v_invoice_email
      USING p_invoice_no;
  END IF;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  IF v_status NOT IN ('UNPAID','REJECTED') THEN
    RAISE EXCEPTION 'Invoice not eligible for confirmation';
  END IF;

  -- Required fields validation
  IF p_payment_method IS NULL OR length(trim(p_payment_method)) = 0 THEN
    RAISE EXCEPTION 'Payment method required';
  END IF;

  IF p_receiver_wallet IS NULL OR length(trim(p_receiver_wallet)) < 32 THEN
    RAISE EXCEPTION 'Receiver wallet required';
  END IF;

  -- Anti-takeover: enforce email match only if invoice has email column AND caller provides email
  IF v_email_col IS NOT NULL
     AND p_email IS NOT NULL AND length(trim(p_email)) > 0
     AND v_invoice_email IS NOT NULL AND length(trim(v_invoice_email)) > 0
  THEN
    IF lower(trim(p_email)) <> lower(trim(v_invoice_email)) THEN
      RAISE EXCEPTION 'Email does not match invoice';
    END IF;
  END IF;

  -- Append-only log
  INSERT INTO public.invoice_confirmations (
    invoice_no, email, payment_method, payer_name, payer_ref, tx_signature, proof_url, receiver_wallet
  ) VALUES (
    p_invoice_no, p_email, p_payment_method, p_payer_name, p_payer_ref, p_tx_signature, p_proof_url, p_receiver_wallet
  );

  -- Update invoice -> pending review
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

-- Permissions (recommended: authenticated only)
REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) TO authenticated;
