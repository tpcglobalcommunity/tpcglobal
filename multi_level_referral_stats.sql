-- Optional: Multi-level referral tracking function
CREATE OR REPLACE FUNCTION public.get_team_stats(p_user_id UUID)
RETURNS TABLE (
  level1_count BIGINT,
  total_team_count BIGINT,
  level2_count BIGINT,
  level3_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE referral_tree AS (
    -- Level 1 (direct referrals)
    SELECT 
      r.referred_id,
      1 as level
    FROM public.referrals r
    WHERE r.referrer_id = p_user_id
    
    UNION ALL
    
    -- Recursive: get all levels below
    SELECT 
      r.referred_id,
      rt.level + 1
    FROM public.referrals r
    JOIN referral_tree rt ON r.referrer_id = rt.referred_id
    WHERE rt.level < 10 -- Limit depth to prevent infinite loops
  )
  SELECT
    COUNT(CASE WHEN level = 1 THEN 1 END) as level1_count,
    COUNT(*) as total_team_count,
    COUNT(CASE WHEN level = 2 THEN 1 END) as level2_count,
    COUNT(CASE WHEN level = 3 THEN 1 END) as level3_count
  FROM referral_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.get_team_stats(UUID) TO authenticated;
