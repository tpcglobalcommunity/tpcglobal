-- Fix Buy TPC create_invoice RPC - Use app_settings only, remove presale_stages dependency

-- Phase 1: Ensure app_settings exists with required keys
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and create new one
DROP POLICY IF EXISTS "Public read access to app_settings" ON public.app_settings;

-- Allow public read access
CREATE POLICY "Public read access to app_settings" ON public.app_settings
  FOR SELECT USING (true);

-- Insert required settings
INSERT INTO public.app_settings (key, value) VALUES
('active_stage', 'stage1'),
('stage1_price_usd', '0.001'),
('stage2_price_usd', '0.002'),
('usd_idr_rate', '17000'),
('treasury_address', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
ON CONFLICT (key) DO NOTHING;

-- Phase 2: Drop all old create_invoice overloads to prevent confusion
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    select p.oid
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public' and p.proname='create_invoice'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS public.create_invoice(' || pg_get_function_identity_arguments(r.oid) || ') CASCADE;';
  END LOOP;
END$$;

-- Phase 3: Create canonical create_invoice using only app_settings
CREATE OR REPLACE FUNCTION public.create_invoice(
  p_tpc_amount numeric,
  p_referral_code text DEFAULT NULL
)
RETURNS TABLE (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  price_usd numeric,
  total_usd numeric,
  total_idr numeric,
  usd_idr_rate numeric,
  treasury_address text,
  expires_at timestamptz,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage text;
  v_price numeric;
  v_rate numeric;
  v_treasury text;
  v_total_usd numeric;
  v_total_idr numeric;
  v_invoice_no text;
  v_expires timestamptz;
BEGIN
  -- Validate input
  IF p_tpc_amount IS NULL OR p_tpc_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid TPC amount';
  END IF;

  -- Safe cap to prevent abuse
  IF p_tpc_amount > 100000000 THEN
    RAISE EXCEPTION 'TPC amount exceeds max per invoice';
  END IF;

  -- Get settings from app_settings only (no presale_stages dependency)
  SELECT
    COALESCE((SELECT value FROM public.app_settings WHERE key='active_stage'), 'stage1'),
    COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate'), 17000),
    COALESCE((SELECT value FROM public.app_settings WHERE key='treasury_address'), '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
  INTO v_stage, v_rate, v_treasury;

  IF v_treasury = '' THEN
    RAISE EXCEPTION 'Treasury address not configured';
  END IF;

  -- Get price based on stage
  IF v_stage = 'stage1' THEN
    v_price := COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd'), 0.001);
  ELSE
    v_price := COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd'), 0.002);
  END IF;

  -- Calculate totals
  v_total_usd := round(p_tpc_amount * v_price, 2);
  v_total_idr := round(v_total_usd * v_rate, 0);

  -- Generate invoice number
  v_invoice_no := 'TPC' || to_char(now(),'YYMMDD') || '-' || substr(md5(random()::text || clock_timestamp()::text),1,8);
  v_expires := now() + interval '24 hours';

  -- Insert into invoices table (use tpc_invoices if exists, otherwise invoices)
  BEGIN
    INSERT INTO public.tpc_invoices (
      invoice_no,
      stage,
      tpc_amount,
      price_usd,
      total_usd,
      total_idr,
      usd_idr_rate,
      treasury_address,
      referral_code,
      status,
      expires_at
    ) VALUES (
      v_invoice_no,
      v_stage,
      p_tpc_amount,
      v_price,
      v_total_usd,
      v_total_idr,
      v_rate,
      v_treasury,
      p_referral_code,
      'UNPAID',
      v_expires
    );
  EXCEPTION WHEN undefined_table THEN
    -- Fallback to invoices table if tpc_invoices doesn't exist
    INSERT INTO public.invoices (
      invoice_no,
      stage,
      tpc_amount,
      price_usd,
      total_usd,
      usd_idr_rate,
      treasury_address,
      referral_code,
      status,
      expires_at
    ) VALUES (
      v_invoice_no,
      v_stage,
      p_tpc_amount,
      v_price,
      v_total_usd,
      v_rate,
      v_treasury,
      p_referral_code,
      'UNPAID',
      v_expires
    );
  END;

  -- Return result
  RETURN QUERY
  SELECT v_invoice_no, v_stage, p_tpc_amount, v_price, v_total_usd, v_total_idr, v_rate, v_treasury, v_expires, 'UNPAID';
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_invoice(numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Buy TPC create_invoice RPC Fixed ===';
  RAISE NOTICE 'Function: create_invoice(p_tpc_amount, p_referral_code)';
  RAISE NOTICE 'Uses: app_settings only (no presale_stages dependency)';
  RAISE NOTICE 'Returns: Complete invoice data';
  RAISE NOTICE 'Permissions: Granted to anon and authenticated';
END $$;
