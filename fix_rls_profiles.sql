-- Fix RLS Policies for Profiles Table
-- Run this in Supabase SQL Editor

-- A) CEK policy profiles sekarang
select
  schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename='profiles'
order by policyname;

-- B) Create helper function (anti-recursive)
create or replace function public.is_admin_verified()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','super_admin')
      and p.verified = true
  );
$$;

grant execute on function public.is_admin_verified() to anon, authenticated;

-- C) Drop all existing policies (clean slate)
do $$
declare r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname='public' and tablename='profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', r.policyname);
  end loop;
end $$;

-- D) Recreate correct policies
alter table public.profiles enable row level security;

-- SELECT: user boleh baca profile sendiri
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- SELECT: admin verified boleh baca semua
create policy "profiles_select_admin_all"
on public.profiles
for select
to authenticated
using (public.is_admin_verified());

-- UPDATE: user boleh update profile sendiri
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- INSERT: user boleh insert profile sendiri (untuk trigger)
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- E) Verify policies
select
  schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public' and tablename='profiles'
order by policyname;
