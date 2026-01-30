-- Payment Confirmation Flow - Database Schema
-- Adds confirmation workflow columns and tables

-- Phase 1: Ensure tpc_invoices has workflow columns
DO $$
BEGIN
    -- Add missing columns to tpc_invoices if they don't exist
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
    
    -- Update status constraint to include new states
    DROP CONSTRAINT IF EXISTS tpc_invoices_status_check ON public.tpc_invoices;
    ALTER TABLE public.tpc_invoices 
    ADD CONSTRAINT tpc_invoices_status_check 
    CHECK (status IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
END $$;

-- Phase 2: Create invoice_confirmations table (append-only log)
CREATE TABLE IF NOT EXISTS public.invoice_confirmations (
    id bigserial PRIMARY KEY,
    invoice_no text NOT NULL,
    user_id uuid NULL,
    email text NULL,
    payment_method text NOT NULL,
    payer_name text NULL,
    payer_ref text NULL,
    tx_signature text NULL,
    proof_url text NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on invoice_confirmations
ALTER TABLE public.invoice_confirmations ENABLE ROW LEVEL SECURITY;

-- Phase 3: RLS Policies
-- invoice_confirmations: no direct INSERT policy (only via RPC)
-- Users can only see their own confirmations
CREATE POLICY "Users can view own confirmations" ON public.invoice_confirmations
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all confirmations
CREATE POLICY "Admins can view all confirmations" ON public.invoice_confirmations
  FOR SELECT USING (public.is_admin_uuid(auth.uid()));

-- Phase 4: Create admin helper function
CREATE OR REPLACE FUNCTION public.is_admin_uuid(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Hardcoded admin UUID list - replace with actual admin UUIDs
    RETURN p_user_id IN (
        '00000000-0000-0000-0000-000000000000'  -- Replace with actual admin UUIDs
        -- Add more admin UUIDs here
    );
END;
$$;

-- Phase 5: Create public invoice retrieval RPC
CREATE OR REPLACE FUNCTION public.get_invoice_public(p_invoice_no text)
RETURNS TABLE (
    invoice_no text,
    stage text,
    tpc_amount numeric,
    price_usd numeric,
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
    created_at timestamptz,
    expires_at timestamptz,
    reviewed_at timestamptz,
    review_note text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.invoice_no,
        i.stage,
        i.tpc_amount,
        i.price_usd,
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
        i.created_at,
        i.expires_at,
        i.reviewed_at,
        i.review_note
    FROM public.tpc_invoices i
    WHERE i.invoice_no = p_invoice_no;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invoice_public(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_uuid(uuid) TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Payment Confirmation Schema Created ===';
  RAISE NOTICE 'Tables: tpc_invoices (updated), invoice_confirmations (new)';
  RAISE NOTICE 'Functions: get_invoice_public, is_admin_uuid';
  RAISE NOTICE 'RLS: Enabled with proper policies';
END $$;
