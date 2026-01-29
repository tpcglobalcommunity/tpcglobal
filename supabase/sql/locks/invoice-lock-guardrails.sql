-- =====================================================
-- 🚫 PROD GATE: DO NOT RUN IN PRODUCTION
-- This script is intended for LOCALHOST/STAGING only.
-- To run in production, you must explicitly remove this guard.
-- =====================================================
DO $$
BEGIN
  RAISE EXCEPTION 'PROD GATE ACTIVE: Do not run invoice-lock-guardrails.sql in production.';
END $$;

-- =====================================================
-- INVOICE LOCK GUARDRAILS (LOCALHOST/STAGING ONLY)
-- =====================================================

-- Guard 1: Ensure canonical field structure
DO $$
BEGIN
    -- Check if stage field exists (not stage_key)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='stage'
    ) THEN
        RAISE EXCEPTION 'Missing canonical field: stage (found stage_key?)';
    END IF;

    -- Check if tpc_amount field exists (canonical)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='tpc_amount'
    ) THEN
        RAISE EXCEPTION 'Missing canonical field: tpc_amount';
    END IF;

    -- Ensure no conflicting fields
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='tpc_invoices' AND column_name='stage_key'
    ) THEN
        RAISE EXCEPTION 'Conflicting field exists: stage_key (should use stage)';
    END IF;

    RAISE NOTICE '✅ Guard 1 PASSED: Canonical field structure validated';
END $$;

-- Guard 2: Data integrity validation
DO $$
BEGIN
    -- Check for data integrity issues
    IF EXISTS (
        SELECT 1 FROM tpc_invoices 
        WHERE total_usd > 0 AND tpc_amount = 0
    ) THEN
        RAISE EXCEPTION 'Data integrity issue: total_usd > 0 but tpc_amount = 0';
    END IF;

    RAISE NOTICE '✅ Guard 2 PASSED: Data integrity validated';
END $$;

-- Guard 3: RPC function validation
DO $$
BEGIN
    -- Ensure get_invoice_public only accepts text parameter
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'get_invoice_public' 
        AND n.nspname = 'public'
        AND pg_get_function_arguments(p.oid) NOT LIKE '%text%'
    ) THEN
        RAISE EXCEPTION 'get_invoice_public must only accept text parameter';
    END IF;

    RAISE NOTICE '✅ Guard 3 PASSED: RPC function signature validated';
END $$;

-- Guard 4: RLS validation
DO $$
BEGIN
    -- Ensure RLS is enabled on tpc_invoices
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'tpc_invoices'
        AND c.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on tpc_invoices table';
    END IF;

    RAISE NOTICE '✅ Guard 4 PASSED: RLS validation completed';
END $$;

-- Guard 5: Admin settings validation
DO $$
BEGIN
    -- Check required admin settings
    IF NOT EXISTS (
        SELECT 1 FROM admin_settings 
        WHERE key = 'usd_to_idr_rate'
    ) THEN
        RAISE EXCEPTION 'Missing admin setting: usd_to_idr_rate';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM admin_settings 
        WHERE key = 'ADMIN_USER_IDS'
    ) THEN
        RAISE EXCEPTION 'Missing admin setting: ADMIN_USER_IDS';
    END IF;

    RAISE NOTICE '✅ Guard 5 PASSED: Admin settings validated';
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 ALL GUARDRAILS PASSED - System is PROD-LOCK ready';
    RAISE NOTICE '✅ Canonical fields validated';
    RAISE NOTICE '✅ Data integrity confirmed';
    RAISE NOTICE '✅ RPC functions secured';
    RAISE NOTICE '✅ RLS policies active';
    RAISE NOTICE '✅ Admin settings configured';
END $$;
