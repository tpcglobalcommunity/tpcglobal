-- UPDATE RPC to use tpc_amount instead of amount
-- This fixes the 400 error by aligning column names

-- Update the create_invoice function to use tpc_amount
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

  -- Get settings from app_settings
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

  -- Insert using tpc_amount (canonical column name)
  INSERT INTO public.tpc_invoices (
    invoice_no,
    buyer_email,
    tpc_amount,        -- FIXED: Use tpc_amount instead of amount
    unit_price_usd,
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
    '',                -- Will be updated by update_invoice_email
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

  -- Return result
  RETURN QUERY
  SELECT v_invoice_no, v_stage, p_tpc_amount, v_unit_price_usd, v_total_usd, v_total_idr, v_rate, v_treasury, v_expires, 'UNPAID';
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;

-- Verification
SELECT 'Updated create_invoice function:' as info;
SELECT pg_get_functiondef('public.create_invoice'::regproc);
