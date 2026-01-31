-- SAFE FIX: Add missing stage column to tpc_invoices table (handles existing constraints)
-- Run this SQL directly in Supabase SQL Editor to fix the 400 error

-- 1) Add stage column if it doesn't exist (safe operation)
ALTER TABLE public.tpc_invoices 
ADD COLUMN IF NOT EXISTS stage text;

-- 2) Add constraint only if it doesn't exist (safe operation)
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

-- 3) Backfill existing records with default stage (idempotent)
UPDATE public.tpc_invoices 
SET stage = COALESCE(
  stage,
  (SELECT value FROM public.app_settings WHERE key = 'active_stage' LIMIT 1),
  'stage1'
)
WHERE stage IS NULL;

-- 4) Make column NOT NULL only if it has no NULL values (safe operation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tpc_invoices 
    WHERE stage IS NULL 
    LIMIT 1
  ) THEN
    ALTER TABLE public.tpc_invoices 
    ALTER COLUMN stage SET NOT NULL;
  END IF;
END $$;

-- 5) Set default for new records (safe operation)
ALTER TABLE public.tpc_invoices 
ALTER COLUMN stage SET DEFAULT 'stage1';

-- 6) Verification queries
SELECT 'Column exists check:' as info;
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name='tpc_invoices' 
  AND column_name='stage';

SELECT 'Backfill results:' as info;
SELECT stage, count(*) as count 
FROM public.tpc_invoices 
GROUP BY stage 
ORDER BY stage;

SELECT 'Constraint check:' as info;
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'public.tpc_invoices'::regclass 
  AND conname = 'tpc_invoices_stage_check';
