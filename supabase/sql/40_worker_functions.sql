-- =====================================================
-- AG3 FULL FIX (create missing table + policies + rpc + worker helpers)
-- Safe to re-run (IF NOT EXISTS / CREATE OR REPLACE)
-- =====================================================

-- 1) TABLE: user_wallets
create table if not exists public.user_wallets (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  chain text not null default 'solana',
  wallet_address text not null,
  is_primary boolean not null default true,
  unique (chain, wallet_address),
  unique (user_id, chain, wallet_address)
);

create index if not exists user_wallets_user_idx
on public.user_wallets (user_id);

create index if not exists user_wallets_primary_idx
on public.user_wallets (chain, is_primary);

-- 2) RLS for user_wallets
alter table public.user_wallets enable row level security;

drop policy if exists "user_wallets_read_own" on public.user_wallets;
create policy "user_wallets_read_own"
on public.user_wallets
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "user_wallets_insert_own" on public.user_wallets;
create policy "user_wallets_insert_own"
on public.user_wallets
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_wallets_delete_own" on public.user_wallets;
create policy "user_wallets_delete_own"
on public.user_wallets
for delete
to authenticated
using (user_id = auth.uid());

-- 3) Cache columns in profiles (tier & balance)
alter table public.profiles
add column if not exists tpc_tier text not null default 'BASIC',
add column if not exists tpc_balance numeric not null default 0,
add column if not exists wallet_verified_at timestamptz;

create index if not exists profiles_tpc_tier_idx
on public.profiles (tpc_tier);

-- 4) RPC: set primary wallet (member action)
create or replace function public.set_primary_wallet(p_wallet_address text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  -- set all wallets non-primary
  update public.user_wallets
  set is_primary = false
  where user_id = auth.uid() and chain = 'solana';

  -- upsert wallet as primary
  insert into public.user_wallets(user_id, chain, wallet_address, is_primary)
  values (auth.uid(), 'solana', p_wallet_address, true)
  on conflict (user_id, chain, wallet_address)
  do update set is_primary = true;

  -- optional notification (only if function exists in your DB)
  -- perform public.push_notification(
  --   auth.uid(),
  --   'WALLET_LINKED',
  --   'Wallet linked',
  --   'Your Solana wallet has been linked. Verification will update your tier shortly.',
  --   jsonb_build_object('wallet', p_wallet_address)
  -- );
end;
$$;

grant execute on function public.set_primary_wallet(text) to authenticated;

-- 5) WORKER: claim wallets batch
create or replace function public.worker_claim_primary_wallets(
  p_limit int default 50
) returns table (
  user_id uuid,
  wallet_address text
)
language sql
stable
security definer
set search_path = public
as $$
  select uw.user_id, uw.wallet_address
  from public.user_wallets uw
  where uw.chain = 'solana'
    and uw.is_primary = true
  order by uw.created_at desc
  limit greatest(1, least(p_limit, 200));
$$;

grant execute on function public.worker_claim_primary_wallets(int) to authenticated;

-- 6) WORKER: update tier cache
create or replace function public.worker_update_tpc_tier(
  p_user_id uuid,
  p_balance numeric,
  p_tier text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    tpc_balance = coalesce(p_balance, 0),
    tpc_tier = coalesce(p_tier, 'BASIC'),
    wallet_verified_at = now(),
    updated_at = now()
  where id = p_user_id;
end;
$$;

grant execute on function public.worker_update_tpc_tier(uuid, numeric, text) to authenticated;
