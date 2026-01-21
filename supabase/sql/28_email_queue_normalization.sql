-- =====================================================
-- FIX EMAIL QUEUE: SENDER-READY + NORMALIZE LEGACY STATUSES + ADD SAFE CONSTRAINT
-- =====================================================

-- 1x paste, idempotent
begin;

-- 1) Add required columns (safe)
alter table public.email_queue
  add column if not exists template_type text not null default 'announcement',
  add column if not exists to_email text,
  add column if not exists to_name text,
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'pending',
  add column if not exists attempts int not null default 0,
  add column if not exists last_error text,
  add column if not exists sent_at timestamptz;

-- 2) Normalize legacy/unknown status values (safe mapping)
update public.email_queue
set status = case
  when status is null or btrim(status) = '' then 'pending'
  when lower(status) in ('pending','queued','queue','new','wait','waiting') then 'pending'
  when lower(status) in ('sending','processing','in_progress','running') then 'sending'
  when lower(status) in ('sent','done','success','completed','delivered') then 'sent'
  when lower(status) in ('failed','fail','error','dead','rejected') then 'failed'
  else 'pending'  -- fallback aman
end;

-- 3) Add index for faster worker scan
create index if not exists idx_email_queue_status_created
on public.email_queue (status, created_at);

-- 4) Add / re-add constraint safely (drop if exists then add)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'email_queue_status_check'
  ) then
    alter table public.email_queue drop constraint email_queue_status_check;
  end if;

  alter table public.email_queue
    add constraint email_queue_status_check
    check (status in ('pending','sending','sent','failed'));
end $$;

commit;

-- Quick verify
select
  status,
  count(*) as total
from public.email_queue
group by status
order by total desc;
