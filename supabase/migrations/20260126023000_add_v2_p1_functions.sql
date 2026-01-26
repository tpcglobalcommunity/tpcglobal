-- Add v2 P1 Functions: Longer History + Batch Drill-Down
-- This migration adds new v2 RPC functions without affecting v1

-- 1A) Daily ≤ 365 hari
create or replace function public.get_public_daily_v2(p_days int default 90)
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
    select (current_date - gs)::date as day
    from generate_series(0, greatest(1, least(p_days, 365)) - 1) gs
  ),
  rev as (
    select created_at::date as day,
           coalesce(sum(amount),0)::numeric(18,6) as revenue,
           count(*)::int as tx_count
    from public.tpc_transactions
    where created_at >= now() - (least(p_days,365) || ' days')::interval
      and type in ('marketplace','staking','subscription')
    group by 1
  ),
  dist as (
    select l.created_at::date as day,
           coalesce(sum(case when l.type='referral' then l.amount end),0)::numeric(18,6) as referral,
           coalesce(sum(case when l.type='treasury' then l.amount end),0)::numeric(18,6) as treasury,
           coalesce(sum(case when l.type='buyback' then l.amount end),0)::numeric(18,6) as buyback
    from public.tpc_distribution_logs l
    where l.created_at >= now() - (least(p_days,365) || ' days')::interval
    group by 1
  )
  select d.day,
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

grant execute on function public.get_public_daily_v2(int) to anon, authenticated;

-- 1B) Batch Drill-Down (Aggregated)
create or replace function public.get_public_batch_summary_v2(p_batch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
begin
  select *
  into b
  from public.tpc_distribution_batches
  where id = p_batch_id;

  if b.id is null then
    raise exception 'batch not found';
  end if;

  return jsonb_build_object(
    'batch', jsonb_build_object(
      'id', b.id,
      'created_at', b.created_at,
      'period_start', b.period_start,
      'period_end', b.period_end,
      'tx_count', b.tx_count,
      'revenue_sum', b.revenue_sum,
      'referral_sum', b.referral_sum,
      'treasury_sum', b.treasury_sum,
      'buyback_sum', b.buyback_sum,
      'public_hash', b.public_hash,
      'onchain_tx', b.onchain_tx
    )
  );
end;
$$;

grant execute on function public.get_public_batch_summary_v2(uuid) to anon, authenticated;

-- Add changelog entry for v2 P1 release
insert into public.tpc_changelog (
  key,
  old_value,
  new_value,
  reason,
  admin_id
) values (
  'v2_p1_release',
  'v1 endpoints only',
  'v1 + v2 P1 endpoints (365-day history, batch drill-down)',
  'v2 P1 released: Extended daily history to 365 days, aggregated batch drill-down',
  'system'
);
