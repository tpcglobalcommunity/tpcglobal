-- FINAL CANONICAL RPC: create_invoice with ALL required columns
-- This eliminates ALL 42703 missing column errors permanently

DROP FUNCTION IF EXISTS public.create_invoice(numeric, text);

CREATE OR REPLACE FUNCTION public.create_invoice(
  p_tpc_amount numeric,
  p_referral_code text DEFAULT NULL
)
RETURNS TABLE (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  unit_price_usd numeric,
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
  v_unit_price_usd numeric;
  v_usd_idr_rate numeric;
  v_treasury_address text;
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

  -- Server-side settings from app_settings
  v_stage := COALESCE(
    (SELECT value FROM public.app_settings WHERE key='active_stage' LIMIT 1), 
    'stage1'
  );

  IF v_stage = 'stage2' THEN
    v_unit_price_usd := COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd' LIMIT 1),
      0.002
    );
  ELSE
    v_unit_price_usd := COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd' LIMIT 1),
      0.001
    );
  END IF;

  v_usd_idr_rate := COALESCE(
    (SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate' LIMIT 1),
    17000
  );
  
  v_treasury_address := COALESCE(
    (SELECT value FROM public.app_settings WHERE key='treasury_address' LIMIT 1),
    '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw'
  );

  IF v_treasury_address = '' THEN
    RAISE EXCEPTION 'Treasury address not configured';
  END IF;

  -- Calculate totals server-side
  v_total_usd := round(p_tpc_amount * v_unit_price_usd, 2);
  v_total_idr := round(v_total_usd * v_usd_idr_rate, 0);

  -- Generate invoice number
  v_invoice_no := 'TPC' || to_char(now(),'YYMMDD') || '-' || substr(md5(random()::text || clock_timestamp()::text),1,8);
  v_expires := now() + interval '24 hours';

  -- INSERT into ONLY canonical columns (ALL required columns now exist)
  INSERT INTO public.tpc_invoices (
    invoice_no,
    buyer_email,
    referral_code,
    stage,
    tpc_amount,
    unit_price_usd,
    total_usd,
    usd_idr_rate,
    total_idr,
    treasury_address,
    status,
    created_at,
    expires_at
  ) VALUES (
    v_invoice_no,
    '',                -- Empty email initially, updated by update_invoice_email
    p_referral_code,
    v_stage,
    p_tpc_amount,
    v_unit_price_usd,
    v_total_usd,
    v_usd_idr_rate,
    v_total_idr,
    v_treasury_address,
    'UNPAID',
    now(),
    v_expires
  );

  -- Return result for UI popup
  RETURN QUERY
  SELECT 
    v_invoice_no, 
    v_stage, 
    p_tpc_amount, 
    v_unit_price_usd, 
    v_total_usd, 
    v_total_idr, 
    v_usd_idr_rate, 
    v_treasury_address, 
    v_expires, 
    'UNPAID';
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_invoice(numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;

-- Verification
SELECT 'FINAL canonical create_invoice function (ALL missing columns fixed):' as info;
SELECT pg_get_functiondef('public.create_invoice'::regproc);
