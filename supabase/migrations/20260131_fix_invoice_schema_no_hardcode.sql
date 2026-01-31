-- Fix invoice schema without hardcoding legacy column names
-- This migration ensures canonical columns exist and safely backfills data

BEGIN;

-- Ensure canonical columns exist
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS tpc_amount numeric;

-- Add stage check constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tpc_invoices_stage_check'
      AND conrelid = 'public.tpc_invoices'::regclass
  ) THEN
    ALTER TABLE public.tpc_invoices
    ADD CONSTRAINT tpc_invoices_stage_check
    CHECK (stage IN ('stage1','stage2','dex','unknown'));
  END IF;
END $$;

-- Backfill stage (safe)
UPDATE public.tpc_invoices
SET stage = COALESCE(
  stage,
  (SELECT value FROM public.app_settings WHERE key='active_stage' LIMIT 1),
  'stage1'
)
WHERE stage IS NULL;

-- Backfill tpc_amount from whichever legacy column EXISTS (NO DIRECT "amount" reference)
DO $$
DECLARE
  legacy_col text;
BEGIN
  SELECT c.column_name INTO legacy_col
  FROM information_schema.columns c
  WHERE c.table_schema='public'
    AND c.table_name='tpc_invoices'
    AND c.column_name IN ('amount_tpc','tpc_qty','token_amount','amount','qty')
  ORDER BY
    CASE c.column_name
      WHEN 'amount_tpc' THEN 1
      WHEN 'tpc_qty' THEN 2
      WHEN 'token_amount' THEN 3
      WHEN 'amount' THEN 4
      WHEN 'qty' THEN 5
      ELSE 999
    END
  LIMIT 1;

  IF legacy_col IS NOT NULL THEN
    EXECUTE format(
      'UPDATE public.tpc_invoices
       SET tpc_amount = COALESCE(tpc_amount, %I::numeric)
       WHERE tpc_amount IS NULL;',
      legacy_col
    );
  END IF;
END $$;

-- Ensure no NULL remains (safe default)
UPDATE public.tpc_invoices
SET tpc_amount = 0
WHERE tpc_amount IS NULL;

-- Defaults for new rows
ALTER TABLE public.tpc_invoices ALTER COLUMN stage SET DEFAULT 'stage1';
ALTER TABLE public.tpc_invoices ALTER COLUMN tpc_amount SET DEFAULT 0;

COMMIT;
