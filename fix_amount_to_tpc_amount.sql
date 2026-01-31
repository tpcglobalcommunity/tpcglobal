-- PRECISE FIX: Handle amount vs tpc_amount column mismatch
-- The RPC uses 'amount' but table needs 'tpc_amount'

-- 1) Add tpc_amount column if it doesn't exist
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS tpc_amount numeric;

-- 2) Backfill tpc_amount from existing amount column
UPDATE public.tpc_invoices
SET tpc_amount = COALESCE(tpc_amount, amount::numeric)
WHERE tpc_amount IS NULL AND amount IS NOT NULL;

-- 3) For any rows where both are NULL, set to 0 (only if they're test/irrelevant rows)
UPDATE public.tpc_invoices
SET tpc_amount = 0
WHERE tpc_amount IS NULL;

-- 4) Make tpc_amount NOT NULL after backfill
ALTER TABLE public.tpc_invoices
ALTER COLUMN tpc_amount SET NOT NULL;

-- 5) Set default for new rows
ALTER TABLE public.tpc_invoices
ALTER COLUMN tpc_amount SET DEFAULT 0;

-- 6) Verification
SELECT 'tpc_amount column status:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'tpc_amount';

SELECT 'Data backfill check:' as info;
SELECT 
  COUNT(*) FILTER (WHERE amount IS NOT NULL) as rows_with_amount,
  COUNT(*) FILTER (WHERE tpc_amount IS NOT NULL) as rows_with_tpc_amount,
  COUNT(*) FILTER (WHERE amount IS NULL AND tpc_amount IS NOT NULL) as backfilled_rows,
  COUNT(*) as total_rows
FROM public.tpc_invoices;
