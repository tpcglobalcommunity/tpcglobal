-- =========================================================
-- 1) Add public_hash to batches
-- =========================================================
alter table public.tpc_distribution_batches
  add column if not exists public_hash text;

create index if not exists idx_batches_public_hash
on public.tpc_distribution_batches(public_hash);

-- =========================================================
-- 2) RPC: generate stable hash for a batch
-- Uses sha256 over a canonical payload:
-- batch_id|created_at|period_start|period_end|tx_count|revenue_sum|referral_sum|treasury_sum|buyback_sum
-- =========================================================
create or replace function public._batch_hash_payload(p_batch_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  payload text;
begin
  select
    id, created_at, period_start, period_end, tx_count,
    revenue_sum, referral_sum, treasury_sum, buyback_sum
  into b
  from public.tpc_distribution_batches
  where id = p_batch_id;

  if b.id is null then
    raise exception 'batch not found';
  end if;

  payload :=
    b.id::text || '|' ||
    coalesce(b.created_at::text,'') || '|' ||
    coalesce(b.period_start::text,'') || '|' ||
    coalesce(b.period_end::text,'') || '|' ||
    b.tx_count::text || '|' ||
    b.revenue_sum::text || '|' ||
    b.referral_sum::text || '|' ||
    b.treasury_sum::text || '|' ||
    b.buyback_sum::text;

  return payload;
end;
$$;

create or replace function public.generate_batch_public_hash(p_batch_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  payload text;
  h text;
begin
  payload := public._batch_hash_payload(p_batch_id);
  -- sha256 hex
  h := encode(digest(payload, 'sha256'), 'hex');

  update public.tpc_distribution_batches
  set public_hash = h
  where id = p_batch_id;

  return h;
end;
$$;

-- Only service role should call this (Edge)
revoke all on function public.generate_batch_public_hash(uuid) from public;
grant execute on function public.generate_batch_public_hash(uuid) to service_role;
