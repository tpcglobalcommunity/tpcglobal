-- Update get_public_batches RPC to include public_hash and onchain_tx
create or replace function public.get_public_batches(p_limit int default 10)
returns table(
  id uuid,
  created_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  tx_count int,
  revenue_sum numeric(18,6),
  referral_sum numeric(18,6),
  treasury_sum numeric(18,6),
  buyback_sum numeric(18,6),
  public_hash text,
  onchain_tx text,
  note text
)
language sql
security definer
set search_path = public
as $$
  select
    b.id, b.created_at, b.period_start, b.period_end,
    b.tx_count, b.revenue_sum, b.referral_sum, b.treasury_sum, b.buyback_sum,
    b.public_hash,
    b.onchain_tx,
    b.note
  from public.tpc_distribution_batches b
  order by b.created_at desc
  limit greatest(p_limit, 1);
$$;

grant execute on function public.get_public_batches(int) to anon, authenticated;
