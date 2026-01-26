-- =========================================================
-- FIX: MISSING PUBLIC RPC ENDPOINTS (404 NOT FOUND)
-- Creates:
--  - public.get_public_metrics()
--  - public.get_public_batches(p_limit int)
-- Safe: read-only, returns empty if tables absent
-- =========================================================

create or replace function public._table_exists(p_table text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = p_table
  );
$$;

-- --- get_public_metrics() : json summary
create or replace function public.get_public_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_wallets int := 0;
  v_updates int := 0;
  v_batches int := 0;
begin
  if public._table_exists('official_wallets') then
    select count(*) into v_wallets
    from public.official_wallets
    where coalesce(is_active, false) = true;
  end if;

  if public._table_exists('public_transparency_updates') then
    select count(*) into v_updates
    from public.public_transparency_updates;
  end if;

  if public._table_exists('distribution_batches') then
    select count(*) into v_batches
    from public.distribution_batches;
  elsif public._table_exists('public_distribution_batches') then
    select count(*) into v_batches
    from public.public_distribution_batches;
  end if;

  return jsonb_build_object(
    'ok', true,
    'wallets_active', v_wallets,
    'updates_total', v_updates,
    'batches_total', v_batches
  );
end;
$$;

grant execute on function public.get_public_metrics() to anon, authenticated;

-- --- get_public_batches(p_limit) : table rows for UI
create or replace function public.get_public_batches(p_limit int default 10)
returns table (
  id text,
  created_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  tx_count int,
  revenue_sum text,
  referral_sum text,
  treasury_sum text,
  buyback_sum text,
  public_hash text,
  onchain_tx text,
  note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if public._table_exists('distribution_batches') then
    return query
    select
      b.id::text,
      b.created_at,
      b.period_start,
      b.period_end,
      coalesce(b.tx_count, 0)::int,
      coalesce(b.revenue_sum, '0')::text,
      coalesce(b.referral_sum, '0')::text,
      coalesce(b.treasury_sum, '0')::text,
      coalesce(b.buyback_sum, '0')::text,
      b.public_hash::text,
      b.onchain_tx::text,
      b.note::text
    from public.distribution_batches b
    order by b.created_at desc
    limit greatest(p_limit, 1);

  elsif public._table_exists('public_distribution_batches') then
    return query
    select
      b.id::text,
      b.created_at,
      b.period_start,
      b.period_end,
      coalesce(b.tx_count, 0)::int,
      coalesce(b.revenue_sum, '0')::text,
      coalesce(b.referral_sum, '0')::text,
      coalesce(b.treasury_sum, '0')::text,
      coalesce(b.buyback_sum, '0')::text,
      b.public_hash::text,
      b.onchain_tx::text,
      b.note::text
    from public.public_distribution_batches b
    order by b.created_at desc
    limit greatest(p_limit, 1);

  else
    return query
    select
      null::text,
      now()::timestamptz,
      now()::timestamptz,
      now()::timestamptz,
      0::int,
      '0'::text,
      '0'::text,
      '0'::text,
      '0'::text,
      null::text,
      null::text,
      null::text
    where false;
  end if;
end;
$$;

grant execute on function public.get_public_batches(int) to anon, authenticated;
