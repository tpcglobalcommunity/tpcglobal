-- 0) Extensions (kalau belum ada gen_random_uuid)
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  brand_name text not null,
  category text not null,
  description text not null,
  website text,
  contact_email text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create index if not exists vendor_applications_user_id_idx on public.vendor_applications(user_id);
create index if not exists vendor_applications_status_idx on public.vendor_applications(status);

-- 2) RLS
alter table public.vendor_applications enable row level security;

-- 3) Policies
drop policy if exists "vendor_applications_insert_own" on public.vendor_applications;
create policy "vendor_applications_insert_own"
on public.vendor_applications
for insert
with check (auth.uid() = user_id);

drop policy if exists "vendor_applications_select_own" on public.vendor_applications;
create policy "vendor_applications_select_own"
on public.vendor_applications
for select
using (auth.uid() = user_id);

-- Admin policy uses profiles.role in ('admin','superadmin')
drop policy if exists "vendor_applications_admin_select" on public.vendor_applications;
create policy "vendor_applications_admin_select"
on public.vendor_applications
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','superadmin')
  )
);

drop policy if exists "vendor_applications_admin_update" on public.vendor_applications;
create policy "vendor_applications_admin_update"
on public.vendor_applications
for update
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','superadmin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','superadmin')
  )
);
