-- =========================================================
-- 1) APP SETTINGS (WALLETS PUBLIC)
-- =========================================================
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- seed wallet settings (edit value sesuai wallet resmi)
insert into public.app_settings(key, value)
values (
  'public_wallets',
  jsonb_build_object(
    'treasury', jsonb_build_object('label','Treasury Wallet','address',''),
    'buyback',  jsonb_build_object('label','Buyback Wallet','address',''),
    'burn',     jsonb_build_object('label','Burn Wallet','address',''),
    'liquidity',jsonb_build_object('label','Liquidity Wallet','address','')
  )
)
on conflict (key) do nothing;

-- =========================================================
-- 2) DISTRIBUTION BATCHES (AUDIT STRONG)
-- =========================================================
create table if not exists public.tpc_distribution_batches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  period_start timestamptz,
  period_end timestamptz,
  tx_count int not null default 0,
  revenue_sum numeric(18,6) not null default 0,
  referral_sum numeric(18,6) not null default 0,
  treasury_sum numeric(18,6) not null default 0,
  buyback_sum numeric(18,6) not null default 0,
  note text,
  created_by uuid
);

alter table public.tpc_distribution_logs
  add column if not exists batch_id uuid references public.tpc_distribution_batches(id) on delete set null;

create index if not exists idx_dist_batch on public.tpc_distribution_logs(batch_id);

-- =========================================================
-- 3) PUBLIC RPC: wallets + batches + daily (variable days)
-- =========================================================
create or replace function public.get_public_wallets()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce((select value from public.app_settings where key='public_wallets'), '{}'::jsonb);
$$;

create or replace function public.get_public_batches(p_limit int default 10)
returns table(
  id uuid,
  created_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  tx_count int,
  revenue_sum numeric(18,6),
  revenue_sum numeric(18,6),
  referral_sum numeric(18,6),
  treasury_sum numeric(18,6),
  buyback_sum numeric(18,6),
  note text
)
language sql
security definer
set search_path = public
as $$
  select
    b.id, b.created_at, b.period_start, b.period_end,
    b.tx_count, b.revenue_sum, b.referral_sum, b.treasury_sum, b.buyback_sum, b.note
  from public.tpc_distribution_batches b
  order by b.created_at desc
  limit greatest(p_limit, 1);
$$;

-- Reuse daily distribution but allow 7/30/90 easily (already exists as get_public_daily_distribution(p_days))
-- We keep the existing RPC and just use it with variable p_days.

-- Grants for public anon
grant select on public.app_settings to service_role;
grant execute on function public.get_public_wallets() to anon, authenticated;
grant execute on function public.get_public_batches(int) to anon, authenticated;
