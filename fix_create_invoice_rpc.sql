-- FIX create_invoice RPC to match canonical tpc_invoices schema
-- This ensures the INSERT uses the correct column names

-- Drop and recreate create_invoice function with correct column mapping
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
  v_unit_price_usd numeric;  -- Renamed from v_price for clarity
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

  -- Get settings from app_settings only
  SELECT
    COALESCE((SELECT value FROM public.app_settings WHERE key='active_stage'), 'stage1'),
    COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate'), 17000),
    COALESCE((SELECT value FROM public.app_settings WHERE key='treasury_address'), '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
  INTO v_stage, v_rate, v_treasury;

  IF v_treasury = '' THEN
    RAISE EXCEPTION 'Treasury address not configured';
  END IF;

  -- Get unit price based on stage
  IF v_stage = 'stage1' THEN
    v_unit_price_usd := COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd'), 0.001);
  ELSE
    v_unit_price_usd := COALESCE((SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd'), 0.002);
  END IF;

  -- Calculate totals
  v_total_usd := round(p_tpc_amount * v_unit_price_usd, 2);
  v_total_idr := round(v_total_usd * v_rate, 0);

  -- Generate invoice number
  v_invoice_no := 'TPC' || to_char(now(),'YYMMDD') || '-' || substr(md5(random()::text || clock_timestamp()::text),1,8);
  v_expires := now() + interval '24 hours';

  -- Insert into tpc_invoices with canonical column names
  BEGIN
    INSERT INTO public.tpc_invoices (
      invoice_no,
      buyer_email,        -- Will be updated later via update_invoice_email
      tpc_amount,         -- Canonical column name
      unit_price_usd,     -- Canonical column name
      total_usd,
      total_idr,
      usd_idr_rate,
      treasury_address,
      referral_code,
      stage,
      status,
      expires_at,
      created_at
    ) VALUES (
      v_invoice_no,
      '',                -- Empty email initially, will be updated
      p_tpc_amount,
      v_unit_price_usd,
      v_total_usd,
      v_total_idr,
      v_rate,
      v_treasury,
      p_referral_code,
      v_stage,
      'UNPAID',
      v_expires,
      now()
    );
  EXCEPTION WHEN undefined_column THEN
    -- Fallback: try with old column names if some are missing
    INSERT INTO public.tpc_invoices (
      invoice_no,
      buyer_email,
      amount,            -- Old column name fallback
      price_usd,         -- Old column name fallback
      total_usd,
      total_idr,
      usd_idr_rate,
      treasury_address,
      referral_code,
      stage,
      status,
      expires_at,
      created_at
    ) VALUES (
      v_invoice_no,
      '',
      p_tpc_amount,
      v_unit_price_usd,
      v_total_usd,
      v_total_idr,
      v_rate,
      v_treasury,
      p_referral_code,
      v_stage,
      'UNPAID',
      v_expires,
      now()
    );
  END;

  -- Return result
  RETURN QUERY
  SELECT v_invoice_no, v_stage, p_tpc_amount, v_unit_price_usd, v_total_usd, v_total_idr, v_rate, v_treasury, v_expires, 'UNPAID';
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_invoice(numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;

-- Verification
SELECT 'create_invoice function updated:' as info;
SELECT pg_get_functiondef('public.create_invoice'::regproc);
