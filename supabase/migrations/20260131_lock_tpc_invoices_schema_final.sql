-- LOCK tpc_invoices canonical schema - ADD ALL REQUIRED COLUMNS
-- This ensures ALL columns exist for create_invoice function

BEGIN;

ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS invoice_no text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS buyer_email text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS referral_code text;

ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS stage text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS tpc_amount numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS unit_price_usd numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS total_usd numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS usd_idr_rate numeric;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS total_idr numeric;

ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS treasury_address text;

ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS created_at timestamptz;
ALTER TABLE public.tpc_invoices ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Defaults
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
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tpc_invoices_stage_check'
      AND conrelid = 'public.tpc_invoices'::regclass
  ) THEN
    ALTER TABLE public.tpc_invoices
    ADD CONSTRAINT tpc_invoices_stage_check
    CHECK (stage IN ('stage1','stage2','dex','unknown'));
  END IF;
END $$;

COMMIT;
