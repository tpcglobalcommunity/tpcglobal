-- CANONICAL create_invoice function - FINAL VERSION
-- This fixes signature mismatch, includes email validation, and restores full functionality

BEGIN;

-- Drop ALL existing create_invoice overloads
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'create_invoice'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s;', r.sig);
  END LOOP;
END $$;

-- Canonical function: 3 params (NO DEFAULT to avoid signature confusion)
CREATE OR REPLACE FUNCTION public.create_invoice(
  p_email text,
  p_tpc_amount numeric,
  p_referral_code text
)
RETURNS public.tpc_invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stage text;
  v_treasury text;
  v_unit_price numeric;
  v_rate numeric;
  v_total_usd numeric;
  v_total_idr numeric;
  v_invoice_no text;
  v_row public.tpc_invoices;
BEGIN
  -- Validate email
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate TPC amount
  IF p_tpc_amount IS NULL OR p_tpc_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid TPC amount';
  END IF;

  IF p_tpc_amount > 100000000 THEN
    RAISE EXCEPTION 'TPC amount exceeds max per invoice';
  END IF;

  -- stage (server-side)
  SELECT COALESCE(
    (SELECT value FROM public.app_settings WHERE key='active_stage' LIMIT 1),
    'stage1'
  ) INTO v_stage;

  -- pricing (server-side)
  IF v_stage = 'stage2' THEN
    SELECT COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd' LIMIT 1),
      0.002
    ) INTO v_unit_price;
  ELSE
    SELECT COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd' LIMIT 1),
      0.001
    ) INTO v_unit_price;
  END IF;

  -- usd/idr rate (server-side)
  SELECT COALESCE(
    (SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate' LIMIT 1),
    17000
  ) INTO v_rate;

  -- treasury address (must exist)
  SELECT NULLIF(trim((
    SELECT value FROM public.app_settings WHERE key='treasury_address' LIMIT 1
  )), '') INTO v_treasury;

  IF v_treasury IS NULL THEN
    RAISE EXCEPTION 'Treasury address not configured';
  END IF;

  v_total_usd := p_tpc_amount * v_unit_price;
  v_total_idr := v_total_usd * v_rate;

  v_invoice_no :=
    'TPC' || to_char(now(), 'YYMMDD') || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 8);

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
  )
  VALUES (
    v_invoice_no,
    p_email,
    p_referral_code,
    v_stage,
    p_tpc_amount,
    v_unit_price,
    v_total_usd,
    v_rate,
    v_total_idr,
    v_treasury,
    'UNPAID',
    now(),
    now() + interval '24 hours'
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Grants (match signature exactly)
REVOKE ALL ON FUNCTION public.create_invoice(text, numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(text, numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(text, numeric, text) TO authenticated;

COMMIT;

-- Verify function exists
SELECT p.oid::regprocedure
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='create_invoice';
