-- EMERGENCY FIX: Add missing stage column to tpc_invoices table
-- Run this SQL directly in Supabase SQL Editor to fix the 400 error

-- First, check if table exists and add stage column
ALTER TABLE public.tpc_invoices 
ADD COLUMN IF NOT EXISTS stage text;

-- Add constraint for data integrity
ALTER TABLE public.tpc_invoices 
ADD CONSTRAINT tpc_invoices_stage_check 
CHECK (stage IN ('stage1','stage2','dex','unknown'));

-- Backfill existing records with default stage
UPDATE public.tpc_invoices 
SET stage = 'stage1' 
WHERE stage IS NULL;

-- Make column NOT NULL after backfill
ALTER TABLE public.tpc_invoices 
ALTER COLUMN stage SET NOT NULL;

-- Set default for new records
ALTER TABLE public.tpc_invoices 
ALTER COLUMN stage SET DEFAULT 'stage1';

-- Verification query
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema='public' 
  AND table_name='tpc_invoices' 
  AND column_name='stage';

-- Check backfill results
SELECT stage, count(*) as count 
FROM public.tpc_invoices 
GROUP BY stage 
ORDER BY stage;
