-- X) ADMIN AUDIT LOG (TABLE + RLS)

create table if not exists public.admin_audit_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  actor_id uuid,
  action text not null,
  target_id uuid,
  payload jsonb
);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_read_admin" on public.admin_audit_log;
create policy "admin_audit_log_read_admin"
on public.admin_audit_log
for select
to authenticated
using (public.is_admin(auth.uid()));
