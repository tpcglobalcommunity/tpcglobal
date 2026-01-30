-- Public Presale Stats
-- Read-only aggregated data for public transparency
-- Accessible to anonymous users

CREATE OR REPLACE FUNCTION public.get_presale_stats_public()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    total_sold BIGINT;
    total_raised DECIMAL;
    unique_buyers BIGINT;
    active_stage_info JSON;
BEGIN
    -- Get total TPC sold from all paid invoices
    SELECT COALESCE(SUM(tpc_amount), 0) 
    INTO total_sold
    FROM tpc_invoices 
    WHERE status = 'PAID';
    
    -- Calculate total USD raised (using stage prices)
    SELECT COALESCE(SUM(i.tpc_amount * s.price_usd), 0)
    INTO total_raised
    FROM tpc_invoices i
    JOIN presale_stages s ON i.stage = s.stage
    WHERE i.status = 'PAID';
    
    -- Count unique buyers (by email)
    SELECT COUNT(DISTINCT buyer_email)
    INTO unique_buyers
    FROM tpc_invoices 
    WHERE status = 'PAID' AND buyer_email IS NOT NULL;
    
    -- Get active stage information
    SELECT json_build_object(
        'name', s.stage,
        'price_usd', s.price_usd,
        'sold', COALESCE(stage_sold.sold, 0),
        'allocation', s.allocation
    )
    INTO active_stage_info
    FROM presale_stages s
    LEFT JOIN (
        SELECT stage, SUM(tpc_amount) as sold
        FROM tpc_invoices 
        WHERE status = 'PAID'
        GROUP BY stage
    ) stage_sold ON s.stage = stage_sold.stage
    WHERE s.status = 'ACTIVE'
    LIMIT 1;
    
    -- Build final result
    result := json_build_object(
        'total_tpc_sold', total_sold,
        'total_usd_raised', total_raised,
        'unique_buyers', unique_buyers,
        'active_stage', active_stage_info,
        'last_updated', EXTRACT(EPOCH FROM NOW())::BIGINT
    );
    
    RETURN result;
END;
$$;

-- Grant execute to public (anonymous users)
GRANT EXECUTE ON FUNCTION public.get_presale_stats_public() TO anon, authenticated;

-- Enable RLS for the function (if needed)
-- This function is SECURITY DEFINER, so it runs with elevated privileges
-- but only returns aggregated, non-sensitive data
