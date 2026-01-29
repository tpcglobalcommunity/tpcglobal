create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.tpc_invoices enable row level security;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname='public'
      and tablename in ('app_settings','profiles','tpc_invoices')
  loop
    execute format('drop policy if exists %I on public.%I;', r.policyname, r.tablename);
  end loop;
end$$;

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

create policy "app_settings_select_authenticated"
on public.app_settings
for select
to authenticated
using (id = 1);

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

drop function if exists public.get_invoice_public(text);

create or replace function public.get_invoice_public(p_invoice_no text)
returns table (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  price_usd numeric,
  total_usd numeric,
  usd_idr_rate numeric,
  total_idr numeric,
  payment_method text,
  treasury_address text,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  paid_at timestamptz,
  admin_note text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    i.invoice_no,
    i.stage,
    i.tpc_amount,
    i.price_usd,
    i.total_usd,
    i.usd_idr_rate,
    i.total_idr,
    i.payment_method,
    i.treasury_address,
    i.status,
    i.created_at,
    i.updated_at,
    i.paid_at,
    i.admin_note
  from public.tpc_invoices i
  where i.invoice_no = p_invoice_no
  limit 1;
end;
$$;

revoke all on function public.get_invoice_public(text) from public;
grant execute on function public.get_invoice_public(text) to anon, authenticated;

drop function if exists public.get_presale_stats_public();

create or replace function public.get_presale_stats_public()
returns table (
  stage text,
  sold_tpc numeric,
  sold_usd numeric,
  sold_idr numeric,
  stage_supply numeric,
  remaining_tpc numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.app_settings%rowtype;
begin
  select * into s from public.app_settings where id = 1;

  return query
  with sold as (
    select
      i.stage,
      coalesce(sum(i.tpc_amount),0) as sold_tpc,
      coalesce(sum(i.total_usd),0) as sold_usd,
      coalesce(sum(i.total_idr),0) as sold_idr
    from public.tpc_invoices i
    where i.status = 'paid'
    group by i.stage
  ), stages as (
    select 'stage1'::text as stage, s.stage1_supply as supply
    union all
    select 'stage2'::text as stage, s.stage2_supply as supply
  )
  select
    st.stage,
    coalesce(sd.sold_tpc,0) as sold_tpc,
    coalesce(sd.sold_usd,0) as sold_usd,
    coalesce(sd.sold_idr,0) as sold_idr,
    st.supply as stage_supply,
    greatest(st.supply - coalesce(sd.sold_tpc,0), 0) as remaining_tpc
  from stages st
  left join sold sd on sd.stage = st.stage
  order by st.stage;
end;
$$;

revoke all on function public.get_presale_stats_public() from public;
grant execute on function public.get_presale_stats_public() to anon, authenticated;

drop function if exists public.get_sales_history_public(int);

create or replace function public.get_sales_history_public(p_limit int default 50)
returns table (
  masked_invoice_no text,
  stage text,
  tpc_amount numeric,
  total_usd numeric,
  total_idr numeric,
  paid_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    case
      when length(i.invoice_no) <= 10 then i.invoice_no
      else substr(i.invoice_no, 1, 8) || '…' || right(i.invoice_no, 4)
    end as masked_invoice_no,
    i.stage,
    i.tpc_amount,
    i.total_usd,
    i.total_idr,
    i.paid_at
  from public.tpc_invoices i
  where i.status = 'paid'
  order by i.paid_at desc nulls last, i.created_at desc
  limit greatest(1, least(p_limit, 200));
end;
$$;

revoke all on function public.get_sales_history_public(int) from public;
grant execute on function public.get_sales_history_public(int) to anon, authenticated;

drop function if exists public.admin_update_invoice_status(text, text, text);

create or replace function public.admin_update_invoice_status(
  p_invoice_no text,
  p_new_status text,
  p_admin_note text default null
)
returns table (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  total_usd numeric,
  total_idr numeric,
  payment_method text,
  treasury_address text,
  status text,
  paid_at timestamptz,
  admin_note text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_email := (auth.jwt() ->> 'email');
  v_is_admin := public.is_admin(auth.uid(), v_email);

  if not v_is_admin then
    raise exception 'Forbidden';
  end if;

  if p_new_status not in ('paid','rejected') then
    raise exception 'Invalid status';
  end if;

  update public.tpc_invoices
  set
    status = p_new_status,
    admin_note = p_admin_note,
    paid_at = case when p_new_status='paid' then coalesce(paid_at, now()) else null end,
    updated_at = now()
  where invoice_no = p_invoice_no;

  return query
  select
    i.invoice_no,
    i.stage,
    i.tpc_amount,
    i.total_usd,
    i.total_idr,
    i.payment_method,
    i.treasury_address,
    i.status,
    i.paid_at,
    i.admin_note,
    i.updated_at
  from public.tpc_invoices i
  where i.invoice_no = p_invoice_no
  limit 1;
end;
$$;

revoke all on function public.admin_update_invoice_status(text, text, text) from public;
grant execute on function public.admin_update_invoice_status(text, text, text) to authenticated;

drop function if exists public.admin_update_usd_idr_rate(numeric);

create or replace function public.admin_update_usd_idr_rate(p_rate numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_rate <= 0 then
    raise exception 'Invalid rate';
  end if;

  v_email := (auth.jwt() ->> 'email');
  v_is_admin := public.is_admin(auth.uid(), v_email);

  if not v_is_admin then
    raise exception 'Forbidden';
  end if;

  update public.app_settings
  set tpc_usd_idr_rate = p_rate, updated_at = now()
  where id = 1;

  return p_rate;
end;
$$;

revoke all on function public.admin_update_usd_idr_rate(numeric) from public;
grant execute on function public.admin_update_usd_idr_rate(numeric) to authenticated;
