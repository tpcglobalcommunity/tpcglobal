-- =====================================================
-- AG3) Wallet binding + token tier cache
-- =====================================================

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

alter table public.user_wallets enable row level security;

-- user can read own
drop policy if exists "user_wallets_read_own" on public.user_wallets;
create policy "user_wallets_read_own"
on public.user_wallets
for select
to authenticated
using (user_id = auth.uid());

-- user can insert own wallet binding
drop policy if exists "user_wallets_insert_own" on public.user_wallets;
create policy "user_wallets_insert_own"
on public.user_wallets
for insert
to authenticated
with check (user_id = auth.uid());

-- user can delete own wallet binding (optional)
drop policy if exists "user_wallets_delete_own" on public.user_wallets;
create policy "user_wallets_delete_own"
on public.user_wallets
for delete
to authenticated
using (user_id = auth.uid());

-- profiles cache fields (tier)
alter table public.profiles
add column if not exists tpc_tier text not null default 'BASIC', -- BASIC/PRO/ELITE
add column if not exists tpc_balance numeric not null default 0,
add column if not exists wallet_verified_at timestamptz;

create index if not exists profiles_tpc_tier_idx
on public.profiles (tpc_tier);
