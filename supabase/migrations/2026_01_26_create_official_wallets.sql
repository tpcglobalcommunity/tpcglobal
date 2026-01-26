-- Migration: Create official_wallets table for transparency
-- File: supabase/migrations/2026_01_26_create_official_wallets.sql

create extension if not exists "pgcrypto";

create table if not exists public.official_wallets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  chain text not null default 'solana',
  address text not null,
  purpose text not null,
  explorer_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.official_wallets enable row level security;

-- Drop existing policy if it exists
drop policy if exists "Public can read official wallets" on public.official_wallets;

-- Create policy for public read access
create policy "Public can read official_wallets"
on public.official_wallets
for select
using (true);

-- Optional: Insert sample data (only if table is empty)
insert into public.official_wallets (name, chain, address, purpose, explorer_url, is_active)
select * from (values
  ('Treasury Wallet','solana','0x0000000000000000000000000000000000000000000','Main treasury for protocol operations','',true),
  ('Buyback Wallet','solana','0x1111111111111111111111111111111111111111111','Token buyback operations','',true),
  ('Operations Wallet','solana','0x2222222222222222222222222222222222222222222','Operational expenses and team payments','',true),
  ('Marketing Wallet','solana','0x3333333333333333333333333333333333333333333','Marketing campaigns and promotional activities','',true),
  ('Community Rewards Wallet','solana','0x4444444444444444444444444444444444444444444','Community rewards and incentive programs','',true),
  ('Development Wallet','solana','0x5555555555555555555555555555555555555555555','Development and infrastructure costs','',true),
  ('Emergency Fund Wallet','solana','0x6666666666666666666666666666666666666666666','Emergency fund for unexpected situations','',true),
  ('Buyback & Burn Wallet','solana','0x7777777777777777777777777777777777777777777','Token buyback and burn operations','',true),
  ('Staking Rewards Wallet','solana','0x8888888888888888888888888888888888888888888888','Staking rewards and validator earnings','',true),
  ('Liquidity Pool Wallet','solana','0x9999999999999999999999999999999999999999999','DEX liquidity pool operations','',true),
  ('Airdrop Wallet','0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','Community airdrop distributions','',true)
) as v(name, chain, address, purpose, explorer_url, is_active)
where not exists (select 1 from public.official_wallets);
