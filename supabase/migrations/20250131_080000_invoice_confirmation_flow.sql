-- ============================================================
-- INVOICE CONFIRMATION FLOW (PRODUCTION-SAFE + GUARDS)
-- Adds: receiver_wallet on tpc_invoices + append-only log table
-- RPC: submit_invoice_confirmation (SECURITY DEFINER)
-- Workflow: UNPAID/REJECTED -> PENDING_REVIEW
-- ============================================================

-- Phase 0: Hard guard - ensure base table exists (clean error)
DO $$
BEGIN
  IF to_regclass('public.tpc_invoices') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.tpc_invoices. Create it first or rename references to your actual invoice table.';
  END IF;
END $$;

-- Phase 1: Add missing columns safely + fix status constraint
DO $$
BEGIN
  -- receiver_wallet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='receiver_wallet'
  ) THEN
    ALTER TABLE public.tpc_invoices ADD COLUMN receiver_wallet text NULL;
  END IF;

  -- updated_at (if missing)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.tpc_invoices ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  -- Ensure status check constraint (drop + recreate)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tpc_invoices_status_check'
      AND conrelid = 'public.tpc_invoices'::regclass
  ) THEN
    ALTER TABLE public.tpc_invoices DROP CONSTRAINT tpc_invoices_status_check;
  END IF;

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

-- We do NOT allow direct table access except admin SELECT.
REVOKE ALL ON public.invoice_confirmations FROM PUBLIC;
REVOKE ALL ON public.invoice_confirmations FROM anon;
REVOKE ALL ON public.invoice_confirmations FROM authenticated;

-- Phase 3: Admin check (UUID whitelist)
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

-- Admin can read all confirmations
DROP POLICY IF EXISTS "Admins can view all confirmations" ON public.invoice_confirmations;
CREATE POLICY "Admins can view all confirmations" ON public.invoice_confirmations
  FOR SELECT
  USING (public.is_admin_uuid(auth.uid()));

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
  -- Lookup invoice
  SELECT i.status, i.email
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

  IF p_payment_method IS NULL OR length(trim(p_payment_method)) = 0 THEN
    RAISE EXCEPTION 'Payment method required';
  END IF;

  IF p_receiver_wallet IS NULL OR length(trim(p_receiver_wallet)) < 32 THEN
    RAISE EXCEPTION 'Receiver wallet required';
  END IF;

  -- Anti-takeover: if email provided, must match invoice email
  IF p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    IF lower(trim(p_email)) <> lower(trim(coalesce(v_invoice_email,''))) THEN
      RAISE EXCEPTION 'Email does not match invoice';
    END IF;
  END IF;

  -- Append-only log
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

REVOKE ALL ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) TO anon;

GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(
  text, text, text, text, text, text, text, text
) TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '=== Invoice Confirmation Flow Ready ===';
  RAISE NOTICE 'tpc_invoices guarded + receiver_wallet ensured';
  RAISE NOTICE 'invoice_confirmations admin-only read';
  RAISE NOTICE 'RPC submit_invoice_confirmation ready';
END $$;
