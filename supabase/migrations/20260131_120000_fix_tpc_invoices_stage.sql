-- Fix missing stage column in tpc_invoices table
-- This fixes the 400 error: column "stage" of relation "tpc_invoices" does not exist

BEGIN;

-- 1) Add stage column if it doesn't exist
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS stage text;

-- 2) Add check constraint for data integrity
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

-- 3) Backfill existing rows with stage1 as default
UPDATE public.tpc_invoices
SET stage = COALESCE(
  stage,
  (SELECT value FROM public.app_settings WHERE key = 'active_stage' LIMIT 1),
  'stage1'
)
WHERE stage IS NULL;

-- 4) Make column NOT NULL after backfill
ALTER TABLE public.tpc_invoices
ALTER COLUMN stage SET NOT NULL;

-- 5) Set default for new rows
ALTER TABLE public.tpc_invoices
ALTER COLUMN stage SET DEFAULT 'stage1';

-- 6) Verification
DO $$
BEGIN
  RAISE NOTICE '=== tpc_invoices stage column fix applied ===';
  RAISE NOTICE 'Column: stage (text, NOT NULL, default: stage1)';
  RAISE NOTICE 'Constraint: tpc_invoices_stage_check (stage1,stage2,dex,unknown)';
  RAISE NOTICE 'Backfill: Existing rows updated with active_stage or stage1';
END $$;

COMMIT;
