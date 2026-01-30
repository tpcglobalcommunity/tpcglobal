-- Public Presale Settings RPC
-- Returns only safe, public information needed for Buy TPC page

CREATE OR REPLACE FUNCTION public.get_presale_settings_public()
RETURNS TABLE (
    active_stage text,
    stage1_price_usd numeric,
    stage2_price_usd numeric,
    usd_idr_rate numeric,
    treasury_address text,
    stage1_sold_tpc numeric,
    stage1_remaining_tpc numeric,
    stage2_sold_tpc numeric,
    stage2_remaining_tpc numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Return query with public presale settings and calculated stats
    RETURN QUERY
    WITH 
    settings AS (
        SELECT 
            COALESCE(active_stage, 'stage1') as active_stage,
            COALESCE(stage1_price_usd, 0.001) as stage1_price_usd,
            COALESCE(stage2_price_usd, 0.002) as stage2_price_usd,
            COALESCE(usd_idr_rate, 17000) as usd_idr_rate,
            COALESCE(treasury_address, '5AeayrU2pdy6yNBeiUpTXkfMxw3VpDQGUHC6kXrBt5vw') as treasury_address
        FROM public.app_settings
        LIMIT 1
    ),
    stage1_stats AS (
        SELECT
            COALESCE(SUM(CASE WHEN stage = 'stage1' AND status IN ('PENDING', 'CONFIRMED', 'APPROVED') THEN tpc_amount ELSE 0 END), 0) as sold_tpc,
            GREATEST(0, (SELECT stage1_price_usd FROM settings) * 100000000 - COALESCE(SUM(CASE WHEN stage = 'stage1' AND status IN ('PENDING', 'CONFIRMED', 'APPROVED') THEN tpc_amount ELSE 0 END), 0)) as remaining_tpc
        FROM public.invoices
    ),
    stage2_stats AS (
        SELECT
            COALESCE(SUM(CASE WHEN stage = 'stage2' AND status IN ('PENDING', 'CONFIRMED', 'APPROVED') THEN tpc_amount ELSE 0 END), 0) as sold_tpc,
            GREATEST(0, (SELECT stage2_price_usd FROM settings) * 100000000 - COALESCE(SUM(CASE WHEN stage = 'stage2' AND status IN ('PENDING', 'CONFIRMED', 'APPROVED') THEN tpc_amount ELSE 0 END), 0)) as remaining_tpc
        FROM public.invoices
    )
    SELECT 
        s.active_stage,
        s.stage1_price_usd,
        s.stage2_price_usd,
        s.usd_idr_rate,
        s.treasury_address,
        st1.sold_tpc as stage1_sold_tpc,
        st1.remaining_tpc as stage1_remaining_tpc,
        st2.sold_tpc as stage2_sold_tpc,
        st2.remaining_tpc as stage2_remaining_tpc
    FROM settings s, stage1_stats st1, stage2_stats st2;
END;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_presale_settings_public() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_presale_settings_public() TO anon;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '=== Public Presale Settings RPC Created ===';
  RAISE NOTICE 'Function: get_presale_settings_public()';
  RAISE NOTICE 'Returns: active stage, prices, rates, treasury, sold/remaining stats';
  RAISE NOTICE 'Permissions: Granted to authenticated and anon users';
END $$;
