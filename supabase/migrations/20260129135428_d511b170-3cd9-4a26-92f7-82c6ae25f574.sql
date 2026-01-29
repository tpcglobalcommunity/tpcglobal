-- TPC Global Database Schema
-- Complete migration with tables, RLS, and security definer functions

create extension if not exists pgcrypto;

-- Updated at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- App Settings Table (singleton)
create table if not exists public.app_settings (
  id int primary key default 1,
  tpc_usd_idr_rate numeric not null default 17000,
  stage1_price_usd numeric not null default 0.001,
  stage2_price_usd numeric not null default 0.002,
  stage1_supply numeric not null default 100000000,
  stage2_supply numeric not null default 100000000,
  admin_user_ids uuid[] not null default array['cd6d5d3d-e59d-4fd0-8543-93da9e3d87c1']::uuid[],
  require_admin_email boolean not null default true,
  admin_email text not null default 'tpcglobal.io@gmail.com',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

-- Profiles Table
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- TPC Invoices Table
create table if not exists public.tpc_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  user_id uuid null references auth.users(id) on delete set null,
  buyer_email text not null,
  stage text not null check (stage in ('stage1','stage2')),
  tpc_amount numeric not null check (tpc_amount > 0),
  price_usd numeric not null check (price_usd > 0),
  total_usd numeric not null check (total_usd >= 0),
  usd_idr_rate numeric not null check (usd_idr_rate > 0),
  total_idr numeric not null check (total_idr >= 0),
  payment_method text not null,
  treasury_address text not null,
  status text not null default 'pending' check (status in ('pending','submitted','paid','rejected')),
  proof_url text null,
  admin_note text null,
  paid_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tpc_invoices_user_id on public.tpc_invoices(user_id);
create index if not exists idx_tpc_invoices_buyer_email on public.tpc_invoices(buyer_email);
create index if not exists idx_tpc_invoices_status on public.tpc_invoices(status);
create index if not exists idx_tpc_invoices_stage on public.tpc_invoices(stage);
create index if not exists idx_tpc_invoices_created_at on public.tpc_invoices(created_at desc);

drop trigger if exists trg_tpc_invoices_updated_at on public.tpc_invoices;
create trigger trg_tpc_invoices_updated_at
before update on public.tpc_invoices
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.tpc_invoices enable row level security;

-- Profiles RLS Policies
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- App Settings RLS - read only for authenticated
create policy "app_settings_select_authenticated"
on public.app_settings
for select
to authenticated
using (id = 1);

-- App Settings RLS - anon can also read for public stats
create policy "app_settings_select_anon"
on public.app_settings
for select
to anon
using (id = 1);

-- Invoices RLS - users see their own
create policy "invoices_select_own"
on public.tpc_invoices
for select
to authenticated
using (
  (user_id = auth.uid())
  or (buyer_email = (auth.jwt() ->> 'email'))
);

create policy "invoices_insert_self"
on public.tpc_invoices
for insert
to authenticated
with check (
  buyer_email = (auth.jwt() ->> 'email')
  and (user_id is null or user_id = auth.uid())
  and status in ('pending','submitted')
);

-- Public can view paid invoices for stats (no PII - handled by RPC)
create policy "invoices_select_paid_public"
on public.tpc_invoices
for select
to anon
using (status = 'paid');

-- is_admin security definer function
create or replace function public.is_admin(p_user_id uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  select * into s from public.app_settings where id = 1;
  if s is null then
    return false;
  end if;

  if not (p_user_id = any(s.admin_user_ids)) then
    return false;
  end if;

  if s.require_admin_email then
    return (p_email = s.admin_email);
  end if;

  return true;
end;
$$;

revoke all on function public.is_admin(uuid, text) from public;
grant execute on function public.is_admin(uuid, text) to authenticated;

-- Admin update policy using is_admin
create policy "admin_update_invoices"
on public.tpc_invoices
for update
to authenticated
using (
  public.is_admin(auth.uid(), (auth.jwt() ->> 'email'))
);

create policy "admin_update_settings"
on public.app_settings
for update
to authenticated
using (
  public.is_admin(auth.uid(), (auth.jwt() ->> 'email'))
);