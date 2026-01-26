-- OFFICIAL WALLETS (Transparency)
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

alter table public.official_wallets enable row level security;

drop policy if exists "Public can read official wallets" on public.official_wallets;

create policy "Public can read official wallets"
on public.official_wallets
for select
using (true);

-- Optional seed: hanya insert jika tabel masih kosong
insert into public.official_wallets (name, chain, address, purpose, explorer_url, is_active)
select * from (values
  ('Treasury Wallet','solana','0x0000000000000000000000000000000000000000000','Main treasury for protocol operations','',true),
  ('Buyback Wallet','solana','0x1111111111111111111111111111111111111111111','Token buyback operations','',true),
  ('Burn Wallet','solana','0x2222222222222222222222222222222222222222222','Burn address / burn operations','',true)
) as v(name, chain, address, purpose, explorer_url, is_active)
where not exists (select 1 from public.official_wallets);
