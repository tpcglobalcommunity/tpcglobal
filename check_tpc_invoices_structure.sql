-- Check tpc_invoices table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema='public' AND table_name='tpc_invoices'
ORDER BY ordinal_position;
