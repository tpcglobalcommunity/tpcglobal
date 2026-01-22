-- =====================================================
-- AG1) PUBLIC TRANSPARENCY DATA (READ-ONLY FOR PUBLIC)
-- =====================================================

create table if not exists public.official_wallets (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  name text not null,           -- e.g. Treasury, Buyback, Burn, Liquidity, Operational
  chain text not null default 'solana',
  address text not null,
  purpose text,
  is_active boolean not null default true,
  explorer_url text
);

create index if not exists official_wallets_active_idx
on public.official_wallets (is_active);

create table if not exists public.public_transparency_updates (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  title text not null,
  body text not null,
  category text not null default 'general', -- general / buyback / burn / liquidity / ops
  tx_hash text,
  amount numeric,
  token_symbol text,
  chain text not null default 'solana'
);

create index if not exists transparency_updates_created_idx
on public.public_transparency_updates (created_at desc);

-- RLS
alter table public.official_wallets enable row level security;
alter table public.public_transparency_updates enable row level security;

-- Public can READ
drop policy if exists "official_wallets_read_all" on public.official_wallets;
create policy "official_wallets_read_all"
on public.official_wallets
for select
to anon, authenticated
using (true);

drop policy if exists "transparency_updates_read_all" on public.public_transparency_updates;
create policy "transparency_updates_read_all"
on public.public_transparency_updates
for select
to anon, authenticated
using (true);

-- No writes from client (admin writes via RPC only)
drop policy if exists "official_wallets_no_write" on public.official_wallets;
create policy "official_wallets_no_write"
on public.official_wallets
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists "transparency_updates_no_write" on public.public_transparency_updates;
create policy "transparency_updates_no_write"
on public.public_transparency_updates
for all
to anon, authenticated
using (false)
with check (false);
