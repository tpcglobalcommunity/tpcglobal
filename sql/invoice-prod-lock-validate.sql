-- TPC Invoice PROD-LOCK Validation SQL (SQLite Version)
-- Run this script in order and paste results to audit report

-- 1) Columns snapshot (pastikan stage & tpc_amount ada)
PRAGMA table_info(invoices);

-- 2) Confirm stage vs stage_key
SELECT name FROM pragma_table_info('invoices') 
WHERE name IN ('stage', 'stage_key') 
ORDER BY name;

-- 3) Confirm tpc_amount field canonical
SELECT name FROM pragma_table_info('invoices') 
WHERE name IN ('tpc_amount', 'qty_tpc', 'qty', 'amount') 
ORDER BY name;

-- 4) List ALL get_invoice_public signatures (API endpoints check)
-- For SQLite/Express, we check API routes instead
-- This will be validated in the Express server routes

-- 5) Check table structure and constraints
SELECT sql FROM sqlite_master 
WHERE type='table' AND name='invoices';

-- 6) REAL DATA: get 3 newest invoices
SELECT invoice_number as invoice_no, tpc_amount, total_usd, total_idr, status, created_at
FROM invoices
ORDER BY created_at DESC
LIMIT 3;

-- 7) REAL TEST: data integrity check
SELECT invoice_number as invoice_no, tpc_amount, total_usd, total_idr, status,
CASE
  WHEN total_usd > 0 AND tpc_amount = 0 THEN '❌ FAIL: mismatch tpc_amount'
  WHEN total_usd > 0 AND tpc_amount > 0 THEN '✅ OK'
  WHEN total_usd = 0 AND tpc_amount = 0 THEN 'ℹ️ zero invoice'
  ELSE '⚠️ review'
END AS verdict
FROM invoices
ORDER BY created_at DESC
LIMIT 3;

-- 8) Check admin settings for default kurs
SELECT key, value, updated_at
FROM admin_settings
WHERE key IN ('usd_to_idr_rate', 'ADMIN_USER_IDS')
ORDER BY key;

-- 9) Check for any potential data exposure in API routes
-- This will be validated by checking the Express server routes

-- 10) Validate invoice number format
SELECT invoice_number, 
       LENGTH(invoice_number) as length,
       SUBSTR(invoice_number, 1, 3) as prefix
FROM invoices
ORDER BY created_at DESC
LIMIT 5;
