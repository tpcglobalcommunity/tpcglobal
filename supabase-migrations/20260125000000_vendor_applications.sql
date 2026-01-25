-- 0) Safety: extensions (uuid gen)
create extension if not exists "pgcrypto";

-- 1) Helper: admin check (adjust column name if your profiles uses user_id instead of id)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where
      -- if your profiles primary user column is user_id, replace p.id with p.user_id
      p.id = auth.uid()
      and coalesce(p.verified, false) = true
      and lower(coalesce(p.role,'')) in ('super_admin','admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2) Main table: vendor applications
create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- vendor identity
  brand_name text not null,
  display_name text,
  category text not null,                 -- keep text for flexibility; you can convert to enum later
  website text,
  contact_email text,
  contact_whatsapp text,
  country text,
  city text,

  -- application payload
  description text,
  offerings jsonb not null default '{}'::jsonb,   -- services/products list, pricing, etc.
  documents jsonb not null default '{}'::jsonb,   -- KYC/portfolio links if any

  -- review fields
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2b) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vendor_applications_updated_at on public.vendor_applications;
create trigger trg_vendor_applications_updated_at
before update on public.vendor_applications
for each row execute function public.set_updated_at();

-- 3) Audit log table (optional but recommended)
create table if not exists public.vendor_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.vendor_applications(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null, -- 'submit' | 'approve' | 'reject' | 'note' | etc
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendor_applications_status on public.vendor_applications(status);
create index if not exists idx_vendor_applications_user on public.vendor_applications(user_id);
create index if not exists idx_vendor_events_app on public.vendor_application_events(application_id);

-- 4) RLS
alter table public.vendor_applications enable row level security;
alter table public.vendor_application_events enable row level security;

-- 5) Policies — vendor_applications
drop policy if exists "vendor_applications_select_admin" on public.vendor_applications;
create policy "vendor_applications_select_admin"
on public.vendor_applications
for select
to authenticated
using (public.is_admin());

drop policy if exists "vendor_applications_select_owner" on public.vendor_applications;
create policy "vendor_applications_select_owner"
on public.vendor_applications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "vendor_applications_insert_owner" on public.vendor_applications;
create policy "vendor_applications_insert_owner"
on public.vendor_applications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "vendor_applications_update_admin" on public.vendor_applications;
create policy "vendor_applications_update_admin"
on public.vendor_applications
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Optional: allow owner to update draft fields only while pending (if you want)
-- (keep OFF for security; uncomment only if needed)
-- drop policy if exists "vendor_applications_update_owner_pending" on public.vendor_applications;
-- create policy "vendor_applications_update_owner_pending"
-- on public.vendor_applications
-- for update
-- to authenticated
-- using (user_id = auth.uid() and status = 'pending')
-- with check (user_id = auth.uid() and status = 'pending');

-- 6) Policies — vendor_application_events (admin only write/read; or allow system inserts)
drop policy if exists "vendor_events_select_admin" on public.vendor_application_events;
create policy "vendor_events_select_admin"
on public.vendor_application_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "vendor_events_insert_admin" on public.vendor_application_events;
create policy "vendor_events_insert_admin"
on public.vendor_application_events
for insert
to authenticated
with check (public.is_admin());

-- 7) Force PostgREST schema cache reload (Supabase)
-- PostgREST listens on channel "pgrst"
notify pgrst, 'reload schema';

-- 8) Quick sanity check (should return 0 rows but no error)
select count(*) as total from public.vendor_applications;
