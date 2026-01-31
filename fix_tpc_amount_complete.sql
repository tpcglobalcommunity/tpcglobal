-- COMPLETE FIX: tpc_amount column + RPC alignment
-- Run after verifying current table structure

-- 1) Add tpc_amount column (safe - IF NOT EXISTS)
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS tpc_amount numeric;

-- 2) Add buyer_email column if missing (common issue)
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS buyer_email text;

-- 3) Add unit_price_usd column if missing (RPC expects this)
ALTER TABLE public.tpc_invoices
ADD COLUMN IF NOT EXISTS unit_price_usd numeric;

-- 4) Backfill tpc_amount from similar columns if they exist
DO $$
BEGIN
  -- Try to backfill from 'amount' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'amount'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET tpc_amount = COALESCE(tpc_amount, amount::numeric) WHERE tpc_amount IS NULL';
    RAISE NOTICE 'Backfilled tpc_amount from amount column';
  END IF;

  -- Try to backfill from 'token_amount' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'token_amount'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET tpc_amount = COALESCE(tpc_amount, token_amount::numeric) WHERE tpc_amount IS NULL';
    RAISE NOTICE 'Backfilled tpc_amount from token_amount column';
  END IF;

  -- Try to backfill from 'qty' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'qty'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET tpc_amount = COALESCE(tpc_amount, qty::numeric) WHERE tpc_amount IS NULL';
    RAISE NOTICE 'Backfilled tpc_amount from qty column';
  END IF;
END $$;

-- 5) Backfill buyer_email from similar columns if they exist
DO $$
BEGIN
  -- Try to backfill from 'email' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'email'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET buyer_email = COALESCE(buyer_email, email) WHERE buyer_email IS NULL';
    RAISE NOTICE 'Backfilled buyer_email from email column';
  END IF;

  -- Try to backfill from 'user_email' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'user_email'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET buyer_email = COALESCE(buyer_email, user_email) WHERE buyer_email IS NULL';
    RAISE NOTICE 'Backfilled buyer_email from user_email column';
  END IF;
END $$;

-- 6) Backfill unit_price_usd from similar columns if they exist
DO $$
BEGIN
  -- Try to backfill from 'price_usd' column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name = 'price_usd'
  ) THEN
    EXECUTE 'UPDATE public.tpc_invoices SET unit_price_usd = COALESCE(unit_price_usd, price_usd) WHERE unit_price_usd IS NULL';
    RAISE NOTICE 'Backfilled unit_price_usd from price_usd column';
  END IF;
END $$;

-- 7) Set defaults for new rows
ALTER TABLE public.tpc_invoices
ALTER COLUMN tpc_amount SET DEFAULT 0;

ALTER TABLE public.tpc_invoices
ALTER COLUMN buyer_email SET DEFAULT '';

ALTER TABLE public.tpc_invoices
ALTER COLUMN unit_price_usd SET DEFAULT 0.001;

-- 8) Verification - show final table structure
SELECT 'Final table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
ORDER BY ordinal_position;

-- 9) Verification - check for any remaining NULL values in critical columns
SELECT 'NULL check for critical columns:' as info;
SELECT 
  COUNT(*) FILTER (WHERE tpc_amount IS NULL) as null_tpc_amount,
  COUNT(*) FILTER (WHERE buyer_email IS NULL) as null_buyer_email,
  COUNT(*) FILTER (WHERE unit_price_usd IS NULL) as null_unit_price_usd,
  COUNT(*) as total_rows
FROM public.tpc_invoices;
