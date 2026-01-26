-- =========================================================
-- PUBLIC TRANSPARENCY RPC (AGGREGATE ONLY, NO PII)
-- =========================================================

-- 1) Metrics ringkas (total revenue + total distribusi)
create or replace function public.get_public_metrics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_revenue numeric(18,6);
  v_verified_revenue numeric(18,6);
  v_distributed_revenue numeric(18,6);

  v_referral numeric(18,6);
  v_treasury numeric(18,6);
  v_buyback numeric(18,6);

  v_tx_total int;
  v_tx_verified int;
  v_tx_distributed int;
begin
  select
    coalesce(sum(amount),0), count(*)
  into v_total_revenue, v_tx_total
  from public.tpc_transactions
  where type in ('marketplace','staking','subscription');

  select
    coalesce(sum(amount),0), count(*)
  into v_verified_revenue, v_tx_verified
  from public.tpc_transactions
  where status = 'verified';

  select
    coalesce(sum(amount),0), count(*)
  into v_distributed_revenue, v_tx_distributed
  from public.tpc_transactions
  where distributed = true;

  select
    coalesce(sum(case when type='referral' then amount end),0),
    coalesce(sum(case when type='treasury' then amount end),0),
    coalesce(sum(case when type='buyback' then amount end),0)
  into v_referral, v_treasury, v_buyback
  from public.tpc_distribution_logs;

  return jsonb_build_object(
    'total_revenue', v_total_revenue,
    'verified_revenue', v_verified_revenue,
    'distributed_revenue', v_distributed_revenue,
    'tx_total', v_tx_total,
    'tx_verified', v_tx_verified,
    'tx_distributed', v_tx_distributed,
    'distributed', jsonb_build_object(
      'referral', v_referral,
      'treasury', v_treasury,
      'buyback', v_buyback
    )
  );
end;
$$;

-- 2) Rekap harian (untuk grafik + CSV)
create or replace function public.get_public_daily_distribution(p_days int default 30)
returns table(
  day date,
  revenue numeric(18,6),
  tx_count int,
  referral numeric(18,6),
  treasury numeric(18,6),
  buyback numeric(18,6)
)
language sql
security definer
set search_path = public
as $$
  with days as (
    select (current_date - (gs::int))::date as day
    from generate_series(0, greatest(p_days, 1) - 1) gs
  ),
  rev as (
    select
      created_at::date as day,
      coalesce(sum(amount),0)::numeric(18,6) as revenue,
      count(*)::int as tx_count
    from public.tpc_transactions
    where created_at >= now() - (p_days || ' days')::interval
      and type in ('marketplace','staking','subscription')
    group by 1
  ),
  dist as (
    select
      l.created_at::date as day,
      coalesce(sum(case when l.type='referral' then l.amount end),0)::numeric(18,6) as referral,
      coalesce(sum(case when l.type='treasury' then l.amount end),0)::numeric(18,6) as treasury,
      coalesce(sum(case when l.type='buyback' then l.amount end),0)::numeric(18,6) as buyback
    from public.tpc_distribution_logs l
    where l.created_at >= now() - (p_days || ' days')::interval
    group by 1
  )
  select
    d.day,
    coalesce(r.revenue,0)::numeric(18,6) as revenue,
    coalesce(r.tx_count,0)::int as tx_count,
    coalesce(s.referral,0)::numeric(18,6) as referral,
    coalesce(s.treasury,0)::numeric(18,6) as treasury,
    coalesce(s.buyback,0)::numeric(18,6) as buyback
  from days d
  left join rev r using(day)
  left join dist s using(day)
  order by d.day asc;
$$;

-- Grants: allow public (anon) to read aggregates safely
grant execute on function public.get_public_metrics() to anon, authenticated;
grant execute on function public.get_public_daily_distribution(int) to anon, authenticated;
