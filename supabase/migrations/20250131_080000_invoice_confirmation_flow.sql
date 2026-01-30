-- ============================================================
-- INVOICE CONFIRMATION FLOW (PRODUCTION-SAFE)
-- Adds: receiver_wallet on tpc_invoices + append-only log table
-- RPC: submit_invoice_confirmation (SECURITY DEFINER)
-- Workflow: UNPAID/REJECTED -> PENDING_REVIEW
-- ============================================================

-- Phase 1: Add missing columns safely
DO $$
BEGIN
  -- receiver_wallet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='receiver_wallet'
  ) THEN
    ALTER TABLE public.tpc_invoices ADD COLUMN receiver_wallet text NULL;
  END IF;

  -- updated_at (if your table doesn't have it)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.tpc_invoices ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Ensure status check constraint (drop + recreate)
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'tpc_invoices_status_check'
        AND conrelid = 'public.tpc_invoices::regclass'
    ) THEN
      ALTER TABLE public.tpc_invoices DROP CONSTRAINT tpc_invoices_status_check;
    END IF;
  END $$;

  ALTER TABLE public.tpc_invoices
    ADD CONSTRAINT tpc_invoices_status_check
    CHECK (status IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
END $$;

-- Phase 2: Confirmation log table (append-only)
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

ALTER TABLE public.invoice_confirmations ENABLE ROW LEVEL SECURITY;

-- IMPORTANT:
-- Users do NOT need to SELECT this log table (avoid privacy leaks).
-- Only admins can view confirmations.
DROP POLICY IF EXISTS "Admins can view all confirmations" ON public.invoice_confirmations;
CREATE POLICY "Admins can view all confirmations" ON public.invoice_confirmations
  FOR SELECT
  USING (public.is_admin_uuid(auth.uid()));

-- We do NOT allow direct INSERT to this table (only via RPC SECURITY DEFINER)
REVOKE ALL ON public.invoice_confirmations FROM PUBLIC;
REVOKE ALL ON public.invoice_confirmations FROM anon;
REVOKE ALL ON public.invoice_confirmations FROM authenticated;

-- Phase 3: Admin check function (UUID whitelist)
-- Uses your locked approach: admin via UUID whitelist.
-- Hardcode the UUID(s) here OR (better) read from app_settings later.
CREATE OR REPLACE FUNCTION public.is_admin_uuid(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN p_user_id IN (
    'cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1'::uuid
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin_uuid(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_uuid(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_uuid(uuid) TO authenticated;

-- Phase 4: RPC submit confirmation
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
  v_invoice_email text;
BEGIN
  -- Basic invoice lookup
  SELECT i.status, i.email  -- <-- kalau kolom email kamu bernama buyer_email, ganti i.email jadi i.buyer_email
    INTO v_status, v_invoice_email
  FROM public.tpc_invoices i
  WHERE i.invoice_no = p_invoice_no
  LIMIT 1;

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

  -- Receiver wallet required
  IF p_receiver_wallet IS NULL OR length(trim(p_receiver_wallet)) < 32 THEN
    RAISE EXCEPTION 'Receiver wallet required';
  END IF;

  -- Anti-takeover: if email is provided, it must match invoice email
  IF p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    IF lower(trim(p_email)) <> lower(trim(coalesce(v_invoice_email,''))) THEN
      RAISE EXCEPTION 'Email does not match invoice';
    END IF;
  END IF;

  -- Log confirmation (append-only)
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

REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) TO anon;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) TO authenticated;

-- Verification Notice
DO $$
BEGIN
  RAISE NOTICE '=== Invoice Confirmation Flow Updated (Fixed) ===';
  RAISE NOTICE 'Added: receiver_wallet on tpc_invoices';
  RAISE NOTICE 'Created: invoice_confirmations (admin-read only)';
  RAISE NOTICE 'RPC: submit_invoice_confirmation (UNPAID/REJECTED -> PENDING_REVIEW)';
  RAISE NOTICE 'Validation: payment_method + receiver_wallet required';
  RAISE NOTICE 'Safety: email must match invoice (if provided)';
END $$;
