-- TPC Invoice PROD-LOCK Validation SQL
-- Run this script in order and paste results to audit report

-- 1) Columns snapshot (pastikan stage & tpc_amount ada)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
ORDER BY ordinal_position;

-- 2) Confirm stage vs stage_key
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
AND column_name IN ('stage','stage_key')
ORDER BY column_name;

-- 3) Confirm tpc_amount field canonical
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
AND column_name IN ('tpc_amount','qty_tpc','qty','amount')
ORDER BY column_name;

-- 4) List ALL get_invoice_public signatures (must be ONLY text)
SELECT p.oid::regprocedure AS signature,
       p.prosecdef AS security_definer,
       pg_get_function_arguments(p.oid) AS args,
       n.nspname AS schema_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE p.proname='get_invoice_public' AND n.nspname='public'
ORDER BY p.oid;

-- 5) Verify grants on RPC
SELECT grantee, privilege_type, grantor
FROM information_schema.role_routine_grants
WHERE routine_schema='public' AND routine_name='get_invoice_public'
ORDER BY grantee, privilege_type;

-- 6) Check RLS enabled + policies for tpc_invoices
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='tpc_invoices';

SELECT polname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='tpc_invoices'
ORDER BY polname;

-- 7) REAL DATA: get 3 newest invoices
SELECT invoice_no, tpc_amount, total_usd, total_idr, stage, status, created_at
FROM public.tpc_invoices
ORDER BY created_at DESC
LIMIT 3;

-- 8) REAL TEST: pick newest invoice_no and test RPC
-- Replace <REAL_INVOICE_NO> with invoice_no from query #7
/*
SELECT invoice_no, tpc_amount, total_usd, total_idr, stage, status,
CASE
  WHEN total_usd > 0 AND tpc_amount = 0 THEN '❌ FAIL: mismatch tpc_amount'
  WHEN total_usd > 0 AND tpc_amount > 0 THEN '✅ OK'
  WHEN total_usd = 0 AND tpc_amount = 0 THEN 'ℹ️ zero invoice'
  ELSE '⚠️ review'
END AS verdict
FROM public.get_invoice_public('<REAL_INVOICE_NO>');
*/

-- 9) Check app_settings for default kurs
SELECT key, value, updated_at
FROM app_settings
WHERE key IN ('usd_to_idr_rate', 'ADMIN_USER_IDS')
ORDER BY key;

-- 10) Check for any potential sensitive data exposure in public functions
SELECT routine_name, routine_type, data_type, external_language
FROM information_schema.routines
WHERE routine_schema='public' 
AND routine_name LIKE '%invoice%'
ORDER BY routine_name;
