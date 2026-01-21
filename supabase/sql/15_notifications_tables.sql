-- =====================================================
-- NOTIFICATIONS AND EMAIL QUEUE TABLES
-- =====================================================

-- Notifications table for in-app notifications
create table if not exists public.notifications (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  payload jsonb,
  is_read boolean not null default false
);

-- Index for efficient user notification queries
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can only read their own notifications
drop policy if exists "notifications_read_own" on public.notifications;
create policy "notifications_read_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

-- Users can only update their own notifications (mark as read)
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Users cannot insert notifications directly (system only)
drop policy if exists "notifications_no_insert" on public.notifications;
create policy "notifications_no_insert"
on public.notifications
for insert
to authenticated
with check (false);

-- Users cannot delete notifications (system only)
drop policy if exists "notifications_no_delete" on public.notifications;
create policy "notifications_no_delete"
on public.notifications
for delete
to authenticated
using (false)
with check (false);

-- =====================================================
-- EMAIL QUEUE TABLE
-- =====================================================

-- Email queue for future email worker
create table if not exists public.email_queue (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  status text not null default 'PENDING',
  to_email text not null,
  subject text not null,
  template text not null,
  variables jsonb,
  last_error text,
  sent_at timestamptz,
  attempts integer default 0
);

-- Index for email worker queries
create index if not exists email_queue_status_created_idx
  on public.email_queue (status, created_at desc);

-- Enable RLS
alter table public.email_queue enable row level security;

-- No direct access to email queue from client
drop policy if exists "email_queue_no_access" on public.email_queue;
create policy "email_queue_no_access"
on public.email_queue
for all
to anon, authenticated
using (false)
with check (false);

-- =====================================================
-- NOTIFICATION HELPERS
-- =====================================================

-- Push notification helper (system only)
create or replace function public.push_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_payload jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications(user_id, type, title, body, payload)
  values (p_user_id, p_type, p_title, p_body, coalesce(p_payload,'{}'::jsonb));
end;
$$;

grant execute on function public.push_notification(uuid, text, text, text, jsonb) to authenticated;

-- Queue email helper (system only)
create or replace function public.queue_email(
  p_to_email text,
  p_subject text,
  p_template text,
  p_variables jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.email_queue(to_email, subject, template, variables)
  values (p_to_email, p_subject, p_template, coalesce(p_variables,'{}'::jsonb));
end;
$$;

grant execute on function public.queue_email(text, text, text, jsonb) to authenticated;

-- =====================================================
-- NOTIFICATION MANAGEMENT HELPERS
-- =====================================================

-- Mark notification as read
create or replace function public.mark_notification_read(p_notification_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set is_read = true
  where id = p_notification_id and user_id = auth.uid();
end;
$$;

grant execute on function public.mark_notification_read(bigint) to authenticated;

-- Mark all notifications as read for user
create or replace function public.mark_all_notifications_read()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.notifications
  set is_read = true
  where user_id = auth.uid() and is_read = false;
  
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.mark_all_notifications_read() to authenticated;

-- Get unread count for user
create or replace function public.get_unread_notification_count()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.notifications
  where user_id = auth.uid() and is_read = false;
$$;

grant execute on function public.get_unread_notification_count() to authenticated;

-- Get recent notifications for user
create or replace function public.get_recent_notifications(p_limit int default 50)
returns table (
  id bigint,
  created_at timestamptz,
  type text,
  title text,
  body text,
  payload jsonb,
  is_read boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select id, created_at, type, title, body, payload, is_read
  from public.notifications
  where user_id = auth.uid()
  order by created_at desc
  limit p_limit;
$$;

grant execute on function public.get_recent_notifications(int) to authenticated;
