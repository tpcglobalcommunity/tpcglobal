-- =====================================================
-- ADMIN LEVEL HELPER FUNCTIONS + RLS UPGRADES
-- =====================================================

-- Super admin check
create or replace function public.is_super_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_uid and p.role = 'super_admin'
  );
$$;

-- Admin level check (admin + super_admin)
create or replace function public.is_admin_level(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_uid and p.role in ('super_admin','admin')
  );
$$;

-- Viewer level check (viewer + admin + super_admin)
create or replace function public.is_viewer_level(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_uid and p.role in ('super_admin','admin','viewer')
  );
$$;

-- Grant permissions to all users (including anonymous)
grant execute on function public.is_super_admin(uuid) to anon, authenticated;
grant execute on function public.is_admin_level(uuid) to anon, authenticated;
grant execute on function public.is_viewer_level(uuid) to anon, authenticated;

-- ==========================================
-- RLS POLICY UPGRADES
-- ==========================================

-- Upgrade audit log read policy to allow viewer level access
alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_read_admin" on public.admin_audit_log;

create policy "admin_audit_log_read_admin"
on public.admin_audit_log
for select
to authenticated
using (public.is_viewer_level(auth.uid())); -- ✅ now admin + viewer + super_admin can read

-- Keep "no write" policy as-is (client cannot write)
create policy "admin_audit_log_no_update"
on public.admin_audit_log
for update
to authenticated
using (false);

create policy "admin_audit_log_no_delete"
on public.admin_audit_log
for delete
to authenticated
using (false);
