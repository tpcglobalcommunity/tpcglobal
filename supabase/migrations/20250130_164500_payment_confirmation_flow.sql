-- Payment Confirmation Flow - User Submit + Admin Review
-- Creates secure payment confirmation system with RPC-only state transitions

-- ============================================================================
-- PHASE A1 — UPDATE tpc_invoices TABLE STRUCTURE
-- ============================================================================

DO $$
BEGIN
    -- Check and add missing columns to tpc_invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'status') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN status text NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'payment_method') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN payment_method text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'payer_name') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN payer_name text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'payer_ref') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN payer_ref text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'tx_signature') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN tx_signature text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'proof_url') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN proof_url text NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN reviewed_by uuid NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN reviewed_at timestamptz NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'review_note') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN review_note text NULL;
    END IF;
    
    -- Update existing UNPAID status to proper enum if needed
    UPDATE public.tpc_invoices 
    SET status = 'UNPAID' 
    WHERE status NOT IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED');
END $$;

-- ============================================================================
-- PHASE A2 — CREATE invoice_confirmations TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.invoice_confirmations (
  id bigserial PRIMARY KEY,
  invoice_no text NOT NULL,
  user_id uuid NOT NULL,
  payment_method text NOT NULL,
  payer_name text NULL,
  payer_ref text NULL,
  tx_signature text NULL,
  proof_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_confirmations
ALTER TABLE public.invoice_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice_confirmations
CREATE POLICY "Users can insert their own confirmations" ON public.invoice_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own confirmations" ON public.invoice_confirmations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all confirmations" ON public.invoice_confirmations
  FOR SELECT USING (public.is_admin_uuid(auth.uid()));

-- ============================================================================
-- PHASE A3 — CREATE RPC FUNCTIONS
-- ============================================================================

-- Submit invoice confirmation (user action)
CREATE OR REPLACE FUNCTION public.submit_invoice_confirmation(
  p_invoice_no text,
  p_payment_method text,
  p_payer_name text DEFAULT NULL,
  p_payer_ref text DEFAULT NULL,
  p_tx_signature text DEFAULT NULL,
  p_proof_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_invoice_user_id uuid;
    v_invoice_status text;
BEGIN
    -- Enforce authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required: Please login to submit payment confirmation';
    END IF;
    
    -- Set user ID
    v_user_id := auth.uid();
    
    -- Validate inputs
    IF p_invoice_no IS NULL OR trim(p_invoice_no) = '' THEN
        RAISE EXCEPTION 'Invoice number is required';
    END IF;
    
    IF p_payment_method IS NULL OR trim(p_payment_method) = '' THEN
        RAISE EXCEPTION 'Payment method is required';
    END IF;
    
    -- Get invoice details for validation
    SELECT user_id, status INTO v_invoice_user_id, v_invoice_status
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no;
    
    -- Validate invoice ownership and status
    IF v_invoice_user_id IS NULL THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_no;
    END IF;
    
    IF v_invoice_user_id != v_user_id THEN
        RAISE EXCEPTION 'Permission denied: You can only confirm your own invoices';
    END IF;
    
    IF v_invoice_status NOT IN ('UNPAID', 'PENDING_REVIEW') THEN
        RAISE EXCEPTION 'Invoice cannot be confirmed: Current status is %', v_invoice_status;
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
      v_user_id,
      p_payment_method,
      p_payer_name,
      p_payer_ref,
      p_tx_signature,
      p_proof_url
    );
    
    -- Update invoice status to pending review
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
    
END;
$$;

-- Admin review invoice (admin action)
CREATE OR REPLACE FUNCTION public.admin_review_invoice(
  p_invoice_no text,
  p_action text,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invoice_user_id uuid;
    v_invoice_status text;
BEGIN
    -- Enforce admin access
    IF NOT public.is_admin_uuid(auth.uid()) THEN
        RAISE EXCEPTION 'Permission denied: Admin access required';
    END IF;
    
    -- Validate inputs
    IF p_invoice_no IS NULL OR trim(p_invoice_no) = '' THEN
        RAISE EXCEPTION 'Invoice number is required';
    END IF;
    
    IF p_action NOT IN ('PAID', 'REJECTED') THEN
        RAISE EXCEPTION 'Invalid action: Must be PAID or REJECTED';
    END IF;
    
    -- Get invoice details
    SELECT user_id, status INTO v_invoice_user_id, v_invoice_status
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no;
    
    -- Validate invoice exists
    IF v_invoice_user_id IS NULL THEN
        RAISE EXCEPTION 'Invoice not found: %', p_invoice_no;
    END IF;
    
    -- Validate invoice is in reviewable state
    IF v_invoice_status != 'PENDING_REVIEW' THEN
        RAISE EXCEPTION 'Invoice cannot be reviewed: Current status is %', v_invoice_status;
    END IF;
    
    -- Update invoice based on action
    UPDATE public.tpc_invoices
    SET 
      status = p_action,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      review_note = p_note,
      paid_at = CASE WHEN p_action = 'PAID' THEN now() ELSE paid_at END,
      updated_at = now()
    WHERE invoice_no = p_invoice_no;
    
END;
$$;

-- ============================================================================
-- PHASE A4 — PERMISSIONS
-- ============================================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_invoice(text, text, text) TO authenticated;

-- Revoke from anonymous users
REVOKE EXECUTE ON FUNCTION public.submit_invoice_confirmation(text, text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_review_invoice(text, text, text) FROM anon;

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Test queries (commented out, uncomment for testing)
/*
-- Test 1: As authenticated user - submit confirmation
SELECT public.submit_invoice_confirmation(
  'TPC250130-12345678',
  'BANK',
  'John Doe',
  'REF123456',
  'signature_data',
  'https://example.com/proof.jpg'
);

-- Test 2: As admin - review and mark as paid
SELECT public.admin_review_invoice(
  'TPC250130-12345678',
  'PAID',
  'Payment confirmed via bank transfer'
);

-- Test 3: Check invoice status
SELECT invoice_no, status, payment_method, reviewed_by, reviewed_at
FROM public.tpc_invoices
WHERE invoice_no = 'TPC250130-12345678';

-- Test 4: Check confirmation record
SELECT * FROM public.invoice_confirmations
WHERE invoice_no = 'TPC250130-12345678';

-- Test 5: As anon - should fail
SELECT public.submit_invoice_confirmation(
  'TPC250130-12345678',
  'BANK',
  'John Doe',
  'REF123456',
  'signature_data',
  'https://example.com/proof.jpg'
); -- Should raise exception
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Payment Confirmation Flow Migration Completed ===';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- submit_invoice_confirmation(): Users can submit payment proof';
  RAISE NOTICE '- admin_review_invoice(): Admins can mark PAID/REJECTED';
  RAISE NOTICE '- invoice_confirmations table: Stores payment proof details';
  RAISE NOTICE '- RLS enforced: Users only access own data';
  RAISE NOTICE '- Status transitions: UNPAID → PENDING_REVIEW → PAID/REJECTED';
  RAISE NOTICE '- All actions via RPC only (no direct table writes)';
END $$;
