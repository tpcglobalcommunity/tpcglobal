-- VERIFICATION QUERIES FOR PUBLIC INVOICE RPCs
-- Run these in Supabase SQL Editor to verify everything works

-- 1. Check if RPC functions are registered correctly
SELECT p.oid::regprocedure
FROM pg_proc p 
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('get_invoice_public','submit_invoice_confirmation')
ORDER BY 1;

-- 2. Test get_invoice_public with a real invoice (replace TPC260131-XXXX with actual invoice)
SELECT * FROM public.get_invoice_public('TPC260131-0001') LIMIT 1;

-- 3. Check current invoice status before testing submit
SELECT invoice_no, status, payment_method, proof_url
FROM public.tpc_invoices
WHERE invoice_no = 'TPC260131-0001';

-- 4. Test submit_invoice_confirmation (replace with actual invoice details)
SELECT * FROM public.submit_invoice_confirmation(
  'TPC260131-0001',
  'BANK',
  'Test User',
  'REF123',
  'TXSIG456',
  'https://example.com/proof.jpg'
);

-- 5. Verify invoice status changed after confirmation
SELECT invoice_no, status, payment_method, proof_url, updated_at
FROM public.tpc_invoices
WHERE invoice_no = 'TPC260131-0001';

-- 6. Verify confirmation log was created
SELECT invoice_no, payment_method, payer_name, user_id, created_at
FROM public.invoice_confirmations
WHERE invoice_no = 'TPC260131-0001'
ORDER BY created_at DESC;

-- 7. Check if invoice_confirmations table structure is correct
\d public.invoice_confirmations;

-- 8. Check if tpc_invoices table has all required columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tpc_invoices' 
  AND table_schema = 'public'
  AND column_name IN ('status', 'payment_method', 'payer_name', 'payer_ref', 'tx_signature', 'proof_url', 'receiver_wallet')
ORDER BY column_name;
