-- =====================================================
-- FIX SUPABASE RPC FUNCTIONS FOR PUBLIC TRANSPARENCY
-- Jalankan ini di Supabase SQL Editor
-- =====================================================

-- 1. CREATE get_public_metrics function
CREATE OR REPLACE FUNCTION get_public_metrics()
RETURNS TABLE (
    tx_distributed BIGINT,
    total_users BIGINT,
    total_revenue DECIMAL,
    last_updated TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(tx_count), 0)::BIGINT as tx_distributed,
        (SELECT COUNT(*) FROM auth.users)::BIGINT as total_users,
        COALESCE(SUM(CAST(revenue_sum AS DECIMAL)), 0)::DECIMAL as total_revenue,
        NOW() as last_updated
    FROM distribution_batches
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
END;
$$;

-- 2. CREATE get_public_batches function
CREATE OR REPLACE FUNCTION get_public_batches(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    tx_count INTEGER,
    revenue_sum TEXT,
    referral_sum TEXT,
    treasury_sum TEXT,
    buyback_sum TEXT,
    public_hash TEXT,
    onchain_tx TEXT,
    note TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id::TEXT,
        created_at,
        period_start,
        period_end,
        tx_count,
        revenue_sum::TEXT,
        referral_sum::TEXT,
        treasury_sum::TEXT,
        buyback_sum::TEXT,
        public_hash::TEXT,
        onchain_tx::TEXT,
        note::TEXT
    FROM distribution_batches
    ORDER BY created_at DESC
    LIMIT p_limit;
END;
$$;

-- 3. CREATE get_public_daily_distribution function
CREATE OR REPLACE FUNCTION get_public_daily_distribution(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    tx_count BIGINT,
    revenue_sum DECIMAL,
    referral_sum DECIMAL,
    treasury_sum DECIMAL,
    buyback_sum DECIMAL
)
LANGUAGE sql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(tx_count), 0)::BIGINT as tx_count,
        COALESCE(SUM(CAST(revenue_sum AS DECIMAL)), 0)::DECIMAL as revenue_sum,
        COALESCE(SUM(CAST(referral_sum AS DECIMAL)), 0)::DECIMAL as referral_sum,
        COALESCE(SUM(CAST(treasury_sum AS DECIMAL)), 0)::DECIMAL as treasury_sum,
        COALESCE(SUM(CAST(buyback_sum AS DECIMAL)), 0)::DECIMAL as buyback_sum
    FROM distribution_batches
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END;
$$;

-- 4. Create tables if they don't exist (for testing)
CREATE TABLE IF NOT EXISTS distribution_batches (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    tx_count INTEGER DEFAULT 0,
    revenue_sum TEXT DEFAULT '0',
    referral_sum TEXT DEFAULT '0',
    treasury_sum TEXT DEFAULT '0',
    buyback_sum TEXT DEFAULT '0',
    public_hash TEXT,
    onchain_tx TEXT,
    note TEXT
);

-- 5. Insert sample data for testing (remove in production)
INSERT INTO distribution_batches (id, tx_count, revenue_sum, referral_sum, treasury_sum, buyback_sum)
VALUES 
    ('batch-001', 150, '1000.50', '200.25', '500.00', '300.25'),
    ('batch-002', 200, '1500.75', '300.50', '750.25', '450.00'),
    ('batch-003', 180, '1200.00', '250.00', '600.00', '350.00')
ON CONFLICT (id) DO NOTHING;

-- 6. Grant execute permissions to public (for RPC calls)
GRANT EXECUTE ON FUNCTION get_public_metrics() TO public;
GRANT EXECUTE ON FUNCTION get_public_batches(INTEGER) TO public;
GRANT EXECUTE ON FUNCTION get_public_daily_distribution(INTEGER) TO public;

-- 7. Grant select permissions on tables
GRANT SELECT ON distribution_batches TO public;

-- =====================================================
-- VERIFICATION QUERIES
-- Jalankan ini untuk verifikasi:
-- =====================================================

-- Test functions:
-- SELECT * FROM get_public_metrics();
-- SELECT * FROM get_public_batches(5);
-- SELECT * FROM get_public_daily_distribution(7);

-- Check function exists:
-- SELECT proname FROM pg_proc WHERE proname LIKE 'get_public%';
