-- =====================================================
-- ADMIN AUDIT LOG TABLE + POLICIES + LOGGING FUNCTION
-- =====================================================

-- 1. Create admin_audit_log table
create table if not exists public.admin_audit_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_id uuid references public.profiles(id),
  payload jsonb
);

-- 2. Enable RLS on admin_audit_log
alter table public.admin_audit_log enable row level security;

-- 3. RLS Policies for admin_audit_log
-- Only admins can read audit logs
create policy "admin_audit_log_read_admin" on public.admin_audit_log
  for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Only admins can insert audit logs (via RPC)
create policy "admin_audit_log_insert_admin" on public.admin_audit_log
  for insert
  to authenticated
  using (public.is_admin(auth.uid()));

-- No one can update audit logs (append-only)
create policy "admin_audit_log_no_update" on public.admin_audit_log
  for update
  to authenticated
  using (false);

-- No one can delete audit logs (append-only)
create policy "admin_audit_log_no_delete" on public.admin_audit_log
  for delete
  to authenticated
  using (false);

-- 4. RPC Function: Log Admin Action
create or replace function public.log_admin_action(
  p_action text,
  p_target_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into public.admin_audit_log (actor_id, action, target_id, payload)
  values (
    auth.uid(),
    p_action,
    p_target_id,
    p_payload
  );
end;
$$;

-- 5. Grant permissions
grant execute on function public.log_admin_action to authenticated;
