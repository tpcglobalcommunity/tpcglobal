-- Fix missing stage column in tpc_invoices table
-- Migration to add stage column with proper constraints and backfill

BEGIN;

-- 1) Add column if missing
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS stage text;

-- 2) Add constraint (allow only known stages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tpc_invoices_stage_check'
  ) THEN
    ALTER TABLE public.tpc_invoices
      ADD CONSTRAINT tpc_invoices_stage_check
      CHECK (stage IN ('stage1','stage2','dex','unknown'));
  END IF;
END $$;

-- 3) Backfill existing rows
UPDATE public.tpc_invoices
SET stage = COALESCE(
  stage,
  (SELECT value FROM public.app_settings WHERE key = 'active_stage' LIMIT 1),
  'stage1'
);

-- 4) Set NOT NULL after backfill
ALTER TABLE public.tpc_invoices
ALTER COLUMN stage SET NOT NULL;

-- 5) Set default to stage1 (RPC will override with actual active_stage)
ALTER TABLE public.tpc_invoices
ALTER COLUMN stage SET DEFAULT 'stage1';

COMMIT;
