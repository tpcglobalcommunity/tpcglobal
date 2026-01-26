-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES (ROLE)
-- =========================================================
alter table public.profiles
  add column if not exists role text default 'member';

create index if not exists idx_profiles_role on public.profiles(role);

-- =========================================================
-- TPC TRANSACTIONS (REVENUE-BASED ONLY)
-- =========================================================
create table if not exists public.tpc_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('marketplace','staking','subscription')),
  amount numeric(18,6) not null check (amount > 0),
  source_id text,
  status text not null check (status in ('pending','verified')) default 'pending',
  verifier_note text,
  verified_at timestamptz,
  distributed boolean not null default false,
  distributed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tpc_tx_user on public.tpc_transactions(user_id);
create index if not exists idx_tpc_tx_status on public.tpc_transactions(status, distributed);

-- =========================================================
-- DISTRIBUTION LOGS (AUDIT TRAIL)
-- =========================================================
create table if not exists public.tpc_distribution_logs (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.tpc_transactions(id) on delete cascade,
  type text not null check (type in ('referral','treasury','buyback')),
  amount numeric(18,6) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (transaction_id, type)
);

create index if not exists idx_tpc_dist_tx on public.tpc_distribution_logs(transaction_id);

-- =========================================================
-- RLS ENABLE
-- =========================================================
alter table public.tpc_transactions enable row level security;
alter table public.tpc_distribution_logs enable row level security;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Users can view own transactions
create policy "tx_select_own"
on public.tpc_transactions
for select
using (auth.uid() = user_id);

-- Admin can view all transactions
create policy "tx_admin_select_all"
on public.tpc_transactions
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Inserts/updates ONLY via service role (Edge)
create policy "tx_service_only_write"
on public.tpc_transactions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Distribution logs: admin read, service write
create policy "dist_admin_select"
on public.tpc_distribution_logs
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "dist_service_write"
on public.tpc_distribution_logs
for insert
with check (auth.role() = 'service_role');
