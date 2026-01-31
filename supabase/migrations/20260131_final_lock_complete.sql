-- FINAL LOCK - Complete fix for all Supabase RPC errors
-- This single migration eliminates all 42703 errors and function overload confusion

BEGIN;

-- =========================================================
-- PHASE 1 — LOCK app_settings (unique key + treasury value)
-- =========================================================

-- 1A) Ensure UNIQUE(key) exists (safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_settings_key_unique'
      AND conrelid = 'public.app_settings'::regclass
  ) THEN
    ALTER TABLE public.app_settings
      ADD CONSTRAINT app_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- 1B) Remove duplicates for treasury_address (keep latest non-empty)
WITH ranked AS (
  SELECT
    ctid,
    key,
    value,
    ROW_NUMBER() OVER (
      PARTITION BY key
      ORDER BY (NULLIF(trim(value), '') IS NULL) ASC, updated_at DESC NULLS LAST
    ) AS rn
  FROM public.app_settings
  WHERE key = 'treasury_address'
)
DELETE FROM public.app_settings a
USING ranked r
WHERE a.ctid = r.ctid
  AND r.rn > 1;

-- 1C) Upsert treasury_address (SOURCE OF TRUTH)
INSERT INTO public.app_settings (key, value)
VALUES ('treasury_address', '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- =========================================================
-- PHASE 2 — LOCK tpc_invoices schema (add ALL required cols)
-- =========================================================

-- Core identifiers
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS buyer_email text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS referral_code text;

-- Purchase + totals
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS tpc_amount numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS unit_price_usd numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS total_usd numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS usd_idr_rate numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS total_idr numeric;

-- Destination
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS treasury_address text;

-- Status + timestamps
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS created_at timestamptz;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Safe defaults
ALTER TABLE public.tpc_invoices ALTER COLUMN status SET DEFAULT 'UNPAID';
ALTER TABLE public.tpc_invoices ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.tpc_invoices ALTER COLUMN stage SET DEFAULT 'stage1';
ALTER TABLE public.tpc_invoices ALTER COLUMN tpc_amount SET DEFAULT 0;
ALTER TABLE public.tpc_invoices ALTER COLUMN usd_idr_rate SET DEFAULT 17000;

-- Backfill created_at/expires_at
UPDATE public.tpc_invoices
SET created_at = COALESCE(created_at, now())
WHERE created_at IS NULL;

UPDATE public.tpc_invoices
SET expires_at = COALESCE(expires_at, created_at + interval '24 hours', now() + interval '24 hours')
WHERE expires_at IS NULL;

-- Stage constraint safe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tpc_invoices_stage_check'
      AND conrelid = 'public.tpc_invoices'::regclass
  ) THEN
    ALTER TABLE public.tpc_invoices
      ADD CONSTRAINT tpc_invoices_stage_check
      CHECK (stage IN ('stage1','stage2','dex','unknown'));
  END IF;
END $$;

-- Status constraint safe (optional but helps prevent garbage states)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tpc_invoices_status_check'
      AND conrelid = 'public.tpc_invoices'::regclass
  ) THEN
    ALTER TABLE public.tpc_invoices
      ADD CONSTRAINT tpc_invoices_status_check
      CHECK (status IN ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
  END IF;
END $$;

-- Backfill stage + treasury_address from app_settings if null
UPDATE public.tpc_invoices
SET stage = COALESCE(
  stage,
  (SELECT value FROM public.app_settings WHERE key='active_stage' LIMIT 1),
  'stage1'
)
WHERE stage IS NULL;

UPDATE public.tpc_invoices
SET treasury_address = COALESCE(
  treasury_address,
  (SELECT value FROM public.app_settings WHERE key='treasury_address' LIMIT 1)
)
WHERE treasury_address IS NULL;

-- =========================================================
-- PHASE 3 — DROP ALL create_invoice overloads (no ambiguity)
-- =========================================================

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

-- =========================================================
-- PHASE 4 — CREATE canonical create_invoice(numeric, text)
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_invoice(
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
  IF p_tpc_amount IS NULL OR p_tpc_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid TPC amount';
  END IF;

  -- stage (server-side)
  SELECT COALESCE(
    (SELECT value FROM public.app_settings WHERE key='active_stage' LIMIT 1),
    'stage1'
  )
  INTO v_stage;

  -- pricing (server-side)
  IF v_stage = 'stage2' THEN
    SELECT COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage2_price_usd' LIMIT 1),
      0.002
    )
    INTO v_unit_price;
  ELSE
    SELECT COALESCE(
      (SELECT value::numeric FROM public.app_settings WHERE key='stage1_price_usd' LIMIT 1),
      0.001
    )
    INTO v_unit_price;
  END IF;

  -- usd/idr rate (server-side)
  SELECT COALESCE(
    (SELECT value::numeric FROM public.app_settings WHERE key='usd_idr_rate' LIMIT 1),
    17000
  )
  INTO v_rate;

  -- treasury address (must exist)
  SELECT NULLIF(trim((
    SELECT value FROM public.app_settings WHERE key='treasury_address' LIMIT 1
  )), '')
  INTO v_treasury;

  IF v_treasury IS NULL THEN
    RAISE EXCEPTION 'Treasury address not configured';
  END IF;

  v_total_usd := p_tpc_amount * v_unit_price;
  v_total_idr := v_total_usd * v_rate;

  -- invoice number
  v_invoice_no :=
    'TPC' || to_char(now(), 'YYMMDD') || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 8);

  INSERT INTO public.tpc_invoices (
    invoice_no,
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

-- Grants
REVOKE ALL ON FUNCTION public.create_invoice(numeric, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_invoice(numeric, text) TO authenticated;

COMMIT;

-- =========================================================
-- VERIFICATION (run results should be clean)
-- =========================================================

SELECT 'treasury_address setting' AS info;
SELECT key, value FROM public.app_settings WHERE key='treasury_address';

SELECT 'create_invoice overloads (should be 1)' AS info;
SELECT p.oid::regprocedure
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname='public' AND p.proname='create_invoice';

SELECT 'tpc_invoices required columns check' AS info;
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
  AND column_name IN (
    'invoice_no','status','created_at','expires_at',
    'stage','tpc_amount','unit_price_usd','total_usd','usd_idr_rate','total_idr',
    'treasury_address','buyer_email','referral_code'
  )
ORDER BY column_name;
