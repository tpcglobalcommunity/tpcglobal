-- RPC-Only Invoice Creation with Server-Side Pricing
-- Creates secure invoice creation RPC with validation and server-side calculations

-- ============================================================================
-- PHASE A1 — ENSURE RLS AND TABLE STRUCTURE
-- ============================================================================

-- Ensure RLS is enabled (should already be from previous migration)
ALTER TABLE IF EXISTS public.tpc_invoices ENABLE ROW LEVEL SECURITY;

-- Remove any existing INSERT/UPDATE policies for regular users
DROP POLICY IF EXISTS "Users can insert invoices" ON public.tpc_invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.tpc_invoices;

-- Keep only SELECT policies (existing from previous migration)
CREATE POLICY IF NOT EXISTS "Users can view own invoices" ON public.tpc_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all invoices" ON public.tpc_invoices
  FOR SELECT USING (public.is_admin_uuid(auth.uid()));

-- ============================================================================
-- PHASE A2 — ADD MISSING COLUMNS (IDEMPOTENT)
-- ============================================================================

DO $$
BEGIN
    -- Check and add missing columns to tpc_invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'invoice_no') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN invoice_no text NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'user_id') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN user_id uuid NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'stage') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN stage text NOT NULL DEFAULT 'stage1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'price_usd') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN price_usd numeric NOT NULL DEFAULT 0.001;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'usd_idr_rate') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN usd_idr_rate numeric NOT NULL DEFAULT 17000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'tpc_amount') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN tpc_amount numeric NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'total_usd') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN total_usd numeric NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'total_idr') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN total_idr numeric NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'treasury_address') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN treasury_address text NOT NULL DEFAULT '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'status') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN status text NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID','EXPIRED','CANCELLED'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'created_at') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'paid_at') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN paid_at timestamptz NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'expires_at') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN expires_at timestamptz NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tpc_invoices' AND column_name = 'referral_code') THEN
        ALTER TABLE public.tpc_invoices ADD COLUMN referral_code text NULL;
    END IF;
    
    -- Create unique constraint on invoice_no if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'tpc_invoices' AND constraint_name = 'tpc_invoices_invoice_no_key') THEN
        ALTER TABLE public.tpc_invoices ADD CONSTRAINT tpc_invoices_invoice_no_key UNIQUE (invoice_no);
    END IF;
END $$;

-- ============================================================================
-- PHASE A3 — CANONICAL SETTINGS SOURCE
-- ============================================================================

-- Ensure app_settings has required keys with safe defaults
DO $$
BEGIN
    -- Check and add missing settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'active_stage') THEN
        ALTER TABLE public.app_settings ADD COLUMN active_stage text NOT NULL DEFAULT 'stage1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'stage1_price_usd') THEN
        ALTER TABLE public.app_settings ADD COLUMN stage1_price_usd numeric NOT NULL DEFAULT 0.001;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'stage2_price_usd') THEN
        ALTER TABLE public.app_settings ADD COLUMN stage2_price_usd numeric NOT NULL DEFAULT 0.002;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'usd_idr_rate') THEN
        ALTER TABLE public.app_settings ADD COLUMN usd_idr_rate numeric NOT NULL DEFAULT 17000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_settings' AND column_name = 'treasury_address') THEN
        ALTER TABLE public.app_settings ADD COLUMN treasury_address text NOT NULL DEFAULT '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw';
    END IF;
    
    -- Insert default settings if table is empty
    IF NOT EXISTS (SELECT 1 FROM public.app_settings LIMIT 1) THEN
        INSERT INTO public.app_settings (
            active_stage,
            stage1_price_usd,
            stage2_price_usd,
            usd_idr_rate,
            treasury_address,
            created_at,
            updated_at
        ) VALUES (
            'stage1',
            0.001,
            0.002,
            17000,
            '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw',
            now(),
            now()
        );
    END IF;
END $$;

-- ============================================================================
-- PHASE A4 — CREATE SECURE INVOICE CREATION RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_invoice(p_tpc_amount numeric, p_referral_code text DEFAULT NULL)
RETURNS TABLE (invoice_no text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_active_stage text;
    v_price_usd numeric;
    v_usd_idr_rate numeric;
    v_treasury_address text;
    v_total_usd numeric;
    v_total_idr numeric;
    v_invoice_no text;
    v_expires_at timestamptz;
    v_max_amount numeric := 100000000; -- Maximum 100M TPC
BEGIN
    -- Enforce authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required: Please login to create invoice';
    END IF;
    
    -- Set user ID
    v_user_id := auth.uid();
    
    -- Validate TPC amount
    IF p_tpc_amount IS NULL OR p_tpc_amount <= 0 THEN
        RAISE EXCEPTION 'Invalid TPC amount: Amount must be greater than 0';
    END IF;
    
    IF p_tpc_amount > v_max_amount THEN
        RAISE EXCEPTION 'Amount too large: Maximum amount is ' || v_max_amount || ' TPC';
    END IF;
    
    -- Read settings from database (server-side truth)
    SELECT 
        active_stage,
        CASE 
            WHEN active_stage = 'stage1' THEN stage1_price_usd
            WHEN active_stage = 'stage2' THEN stage2_price_usd
            ELSE stage1_price_usd
        END as price_usd,
        usd_idr_rate,
        treasury_address
    INTO v_active_stage, v_price_usd, v_usd_idr_rate, v_treasury_address
    FROM public.app_settings
    LIMIT 1;
    
    -- Calculate totals server-side (prevent tampering)
    v_total_usd := p_tpc_amount * v_price_usd;
    v_total_idr := v_total_usd * v_usd_idr_rate;
    
    -- Generate unique invoice number (human-readable but non-guessable)
    v_invoice_no := 'TPC' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 8));
    
    -- Set expiration (24 hours from now)
    v_expires_at := now() + interval '24 hours';
    
    -- Insert invoice with server-side calculated values
    INSERT INTO public.tpc_invoices (
        invoice_no,
        user_id,
        stage,
        price_usd,
        usd_idr_rate,
        tpc_amount,
        total_usd,
        total_idr,
        treasury_address,
        status,
        created_at,
        expires_at,
        referral_code
    ) VALUES (
        v_invoice_no,
        v_user_id,
        v_active_stage,
        v_price_usd,
        v_usd_idr_rate,
        p_tpc_amount,
        v_total_usd,
        v_total_idr,
        v_treasury_address,
        'UNPAID',
        now(),
        v_expires_at,
        p_referral_code
    );
    
    -- Return invoice number
    RETURN QUERY SELECT v_invoice_no as invoice_no;
END;
$$;

-- ============================================================================
-- PHASE A5 — OPTIONAL CANCEL INVOICE RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cancel_invoice(p_invoice_no text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_invoice_user_id uuid;
BEGIN
    -- Enforce authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required: Please login to cancel invoice';
    END IF;
    
    -- Set user ID
    v_user_id := auth.uid();
    
    -- Get invoice user_id for verification
    SELECT user_id INTO v_invoice_user_id
    FROM public.tpc_invoices
    WHERE invoice_no = p_invoice_no
    LIMIT 1;
    
    -- Verify ownership and status
    IF v_invoice_user_id IS NULL THEN
        RAISE EXCEPTION 'Invoice not found: ' || p_invoice_no;
    END IF;
    
    IF v_invoice_user_id != v_user_id THEN
        RAISE EXCEPTION 'Permission denied: You can only cancel your own invoices';
    END IF;
    
    IF status != 'UNPAID' THEN
        RAISE EXCEPTION 'Invoice cannot be cancelled: Current status is ' || status;
    END IF;
    
    -- Update status to CANCELLED
    UPDATE public.tpc_invoices
    SET status = 'CANCELLED',
        updated_at = now()
    WHERE invoice_no = p_invoice_no;
END;
$$;

-- ============================================================================
-- PHASE A6 — PERMISSIONS
-- ============================================================================

-- Grant execute permissions for authenticated users only
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_invoice(text) TO authenticated;

-- Revoke from anonymous users
REVOKE EXECUTE ON FUNCTION public.create_invoice(numeric, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_invoice(text) FROM anon;

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing)
-- ============================================================================

-- Test queries (commented out, uncomment for testing)
/*
-- Test 1: As authenticated user - should work
SELECT * FROM public.create_invoice(1000, 'REF123');

-- Test 2: As authenticated user - cancel own invoice
SELECT public.cancel_invoice('TPC250130-12345678');

-- Test 3: As anon - should fail
SELECT * FROM public.create_invoice(1000, 'REF123'); -- Should raise exception

-- Test 4: Check invoice was created with server-side calculations
SELECT invoice_no, tpc_amount, price_usd, total_usd, total_idr, status 
FROM public.tpc_invoices 
WHERE invoice_no = 'TPC250130-12345678';

-- Test 5: Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'tpc_invoices'
ORDER BY policyname;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== RPC-Only Invoice Creation Migration Completed ===';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- create_invoice(): Server-side pricing and validation';
  RAISE NOTICE '- cancel_invoice(): Cancel own unpaid invoices';
  RAISE NOTICE '- All calculations done server-side (prevent tampering)';
  RAISE NOTICE '- Invoice numbers generated server-side (unique and secure)';
  RAISE NOTICE '- RLS enforced: No direct table writes from client';
  RAISE NOTICE '- Settings sourced from database (single source of truth)';
END $$;
