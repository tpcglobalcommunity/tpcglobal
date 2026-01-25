-- =========================================================
-- TPC GLOBAL - VENDOR REVIEW (RPC) + MARKETPLACE ITEMS (RLS)
-- PRODUCTION-READY, 1x PASTE
-- =========================================================

-- 0) Extensions
create extension if not exists "pgcrypto";

-- 1) Updated_at trigger helper (safe create)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Admin check (assumes public.profiles exists with: id, role, verified)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and coalesce(p.verified,false) = true
      and lower(coalesce(p.role,'')) in ('super_admin','admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3) Ensure vendor_applications + events exist (NO-OP if already created)
create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  display_name text,
  category text not null,
  website text,
  contact_email text,
  contact_whatsapp text,
  country text,
  city text,
  description text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_vendor_applications_updated_at on public.vendor_applications;
create trigger trg_vendor_applications_updated_at
before update on public.vendor_applications
for each row execute function public.set_updated_at();

create table if not exists public.vendor_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.vendor_applications(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_applications_status on public.vendor_applications(status);
create index if not exists idx_vendor_applications_user on public.vendor_applications(user_id);
create index if not exists idx_vendor_events_app on public.vendor_application_events(application_id);

-- 4) RLS vendor tables (if not enabled yet)
alter table public.vendor_applications enable row level security;
alter table public.vendor_application_events enable row level security;

-- Policies vendor_applications (safe recreate)
drop policy if exists "vendor_applications_select_admin" on public.vendor_applications;
create policy "vendor_applications_select_admin"
on public.vendor_applications
for select to authenticated
using (public.is_admin());

drop policy if exists "vendor_applications_select_owner" on public.vendor_applications;
create policy "vendor_applications_select_owner"
on public.vendor_applications
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "vendor_applications_insert_owner" on public.vendor_applications;
create policy "vendor_applications_insert_owner"
on public.vendor_applications
for insert to authenticated
with check (user_id = auth.uid());

-- NOTE: kita tetap boleh keep update admin policy, tapi UI sebaiknya pakai RPC biar reviewed_by/at aman
drop policy if exists "vendor_applications_update_admin" on public.vendor_applications;
create policy "vendor_applications_update_admin"
on public.vendor_applications
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "vendor_events_select_admin" on public.vendor_application_events;
create policy "vendor_events_select_admin"
on public.vendor_application_events
for select to authenticated
using (public.is_admin());

drop policy if exists "vendor_events_insert_admin" on public.vendor_application_events;
create policy "vendor_events_insert_admin"
on public.vendor_application_events
for insert to authenticated
with check (public.is_admin());

-- 5) ADMIN RPC: approve/reject vendor application (atomic + audit log)
create or replace function public.review_vendor_application(
  p_application_id uuid,
  p_status text,
  p_admin_note text default null
)
returns public.vendor_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.vendor_applications;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_status not in ('approved','rejected','pending') then
    raise exception 'invalid status: %', p_status;
  end if;

  update public.vendor_applications
  set status = p_status,
      admin_note = p_admin_note,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_application_id
  returning * into v_row;

  if not found then
    raise exception 'application not found';
  end if;

  insert into public.vendor_application_events(application_id, actor_id, action, meta)
  values (
    p_application_id,
    auth.uid(),
    case when p_status='approved' then 'approve'
         when p_status='rejected' then 'reject'
         else 'set_status' end,
    jsonb_build_object('status', p_status, 'admin_note', p_admin_note)
  );

  return v_row;
end;
$$;

revoke all on function public.review_vendor_application(uuid,text,text) from public;
grant execute on function public.review_vendor_application(uuid,text,text) to authenticated;

-- =========================================================
-- 6) MARKETPLACE ITEMS (TABLE + RLS)
-- =========================================================

-- Create table if missing (the UI error earlier indicates it was missing at that time)
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),

  -- ownership
  vendor_user_id uuid not null references auth.users(id) on delete cascade,

  -- optional link to application that approved them (good for audit)
  vendor_application_id uuid references public.vendor_applications(id) on delete set null,

  -- content
  title text not null,
  slug text not null,
  category text not null, -- e.g. services | education | technology | consulting | media | other
  short_desc text,
  description text,
  website text,
  contact_email text,
  contact_whatsapp text,

  -- commerce/meta
  price_from numeric,
  currency text not null default 'USD',
  tags text[] not null default '{}',
  media jsonb not null default '{}'::jsonb, -- {cover:"", gallery:[...]}
  meta jsonb not null default '{}'::jsonb,  -- flexible

  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint marketplace_items_slug_unique unique (slug)
);

create index if not exists idx_marketplace_items_status on public.marketplace_items(status);
create index if not exists idx_marketplace_items_vendor on public.marketplace_items(vendor_user_id);
create index if not exists idx_marketplace_items_updated on public.marketplace_items(updated_at desc);

drop trigger if exists trg_marketplace_items_updated_at on public.marketplace_items;
create trigger trg_marketplace_items_updated_at
before update on public.marketplace_items
for each row execute function public.set_updated_at();

-- RLS enable
alter table public.marketplace_items enable row level security;

-- Helper: vendor is approved?
create or replace function public.is_approved_vendor(p_uid uuid)
returns boolean
language sql
security defifier
set search_path = public
as $$
  select exists (
    select 1 from public.vendor_applications va
    where va.user_id = p_uid
      and va.status = 'approved'
  );
$$;

revoke all on function public.is_approved_vendor(uuid) from public;
grant execute on function public.is_approved_vendor(uuid) to authenticated;

-- Policies marketplace_items
drop policy if exists "marketplace_select_published_anon" on public.marketplace_items;
create policy "marketplace_select_published_anon"
on public.marketplace_items
for select to anon
using (status = 'published');

drop policy if exists "marketplace_select_published_auth" on public.marketplace_items;
create policy "marketplace_select_published_auth"
on public.marketplace_items
for select to authenticated
using (status = 'published' or public.is_admin() or vendor_user_id = auth.uid());

-- Vendor can insert ONLY if approved vendor and owns row
drop policy if exists "marketplace_insert_vendor_approved" on public.marketplace_items;
create policy "marketplace_insert_vendor_approved"
on public.marketplace_items
for insert to authenticated
with check (
  vendor_user_id = auth.uid()
  and public.is_approved_vendor(auth.uid())
);

-- Vendor can update their own rows; recommended: allow draft/published fields, but keep safe
drop policy if exists "marketplace_update_vendor_owner" on public.marketplace_items;
create policy "marketplace_update_vendor_owner"
on public.marketplace_items
for update to authenticated
using (vendor_user_id = auth.uid() and public.is_approved_vendor(auth.uid()))
with check (vendor_user_id = auth.uid());

-- Admin full access (select/update/delete)
drop policy if exists "marketplace_admin_all" on public.marketplace_items;
create policy "marketplace_admin_all"
on public.marketplace_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Optional: auto set published_at when status becomes published
create or replace function public.marketplace_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at = now();
  end if;

  if new.status <> 'published' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_marketplace_set_published_at on public.marketplace_items;
create trigger trg_marketplace_set_published_at
before update on public.marketplace_items
for each row execute function public.marketplace_set_published_at();

-- =========================================================
-- 7) Reload PostgREST schema cache
-- =========================================================
notify pgrst, 'reload schema';

-- =========================================================
-- 8) Quick verification
-- =========================================================
select
  to_regclass('public.vendor_applications') as vendor_tbl,
  to_regclass('public.marketplace_items') as marketplace_tbl;

select count(*) as vendor_count from public.vendor_applications;
select count(*) as marketplace_count from public.marketplace_items;
