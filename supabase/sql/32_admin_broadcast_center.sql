-- =====================================================
-- ADMIN BROADCAST CENTER (DB + RPC ENQUEUE) - PRODUCTION SAFE
-- =====================================================

-- Requires: profiles table with columns: id (uuid), email (text), full_name (text), role (text), verified (boolean), lang (text)
-- Works with your existing email_queue (legacy) because we enqueue template_type/lang/to_email/to_name/payload
-- and you already have trigger autofill legacy "template"/"subject" + worker that sends from templates.

begin;

-- 0) Extensions
create extension if not exists pgcrypto;

-- 1) Ensure admin checker exists (fix for earlier "public.is_admin(uuid) does not exist")
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_uid
      and lower(coalesce(p.role,'')) in ('admin','super_admin')
  );
$$;

-- 2) Broadcasts table
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null,
  title text not null,
  message text not null,
  template_type text not null default 'announcement', -- uses email_templates
  lang_mode text not null default 'auto',            -- 'auto' | 'en' | 'id'
  target_role text null,                              -- null = all roles
  verified_only boolean not null default true,
  status text not null default 'queued',              -- draft|queued|sent|cancelled
  scheduled_at timestamptz null,
  total_recipients int not null default 0,
  enqueued_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname='broadcasts_status_check') then
    alter table public.broadcasts
      add constraint broadcasts_status_check
      check (status in ('draft','queued','sent','cancelled'));
  end if;
end $$;

-- updated_at trigger (reuse if already exists)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname='trg_broadcasts_updated_at') then
    create trigger trg_broadcasts_updated_at
    before update on public.broadcasts
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- 3) Add broadcast_id to email_queue for tracking (safe)
alter table public.email_queue
  add column if not exists broadcast_id uuid;

create index if not exists idx_email_queue_broadcast_status
on public.email_queue (broadcast_id, status, created_at);

-- 4) RPC: create broadcast + enqueue recipients
-- Filters:
-- - target_role: null = all
-- - verified_only: true = only verified
-- - lang_mode: 'auto' uses profiles.lang; 'en' forces en; 'id' forces id
-- - limit_n: optional safety limit for testing (null = all)
create or replace function public.admin_create_broadcast_and_enqueue(
  p_title text,
  p_message text,
  p_lang_mode text default 'auto',
  p_target_role text default null,
  p_verified_only boolean default true,
  p_limit_n int default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_broadcast_id uuid;
  v_lang_mode text := lower(coalesce(p_lang_mode,'auto'));
  v_inserted int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(v_uid) then
    raise exception 'Admin only';
  end if;

  if btrim(coalesce(p_title,'')) = '' then
    raise exception 'Title is required';
  end if;

  if btrim(coalesce(p_message,'')) = '' then
    raise exception 'Message is required';
  end if;

  if v_lang_mode not in ('auto','en','id') then
    raise exception 'Invalid lang_mode (use auto|en|id)';
  end if;

  insert into public.broadcasts (
    created_by, title, message, template_type, lang_mode, target_role, verified_only, status
  ) values (
    v_uid, p_title, p_message, 'announcement', v_lang_mode, nullif(btrim(p_target_role),''), p_verified_only, 'queued'
  )
  returning id into v_broadcast_id;

  -- Enqueue email_queue rows
  with recipients as (
    select
      p.id as profile_id,
      p.email as to_email,
      coalesce(nullif(btrim(p.full_name),''), 'Member') as to_name,
      case
        when v_lang_mode = 'auto' then coalesce(nullif(lower(btrim(p.lang)),''), 'en')
        else v_lang_mode
      end as lang_final
    from public.profiles p
    where p.email is not null and btrim(p.email) <> ''
      and (p_target_role is null or lower(coalesce(p.role,'')) = lower(p_target_role))
      and (not p_verified_only or coalesce(p.verified,false) = true)
    order by p.created_at asc nulls last
    limit coalesce(p_limit_n, 2147483647)
  )
  insert into public.email_queue (
    broadcast_id,
    template_type,
    lang,
    to_email,
    to_name,
    payload,
    status
  )
  select
    v_broadcast_id,
    'announcement',
    r.lang_final,
    r.to_email,
    r.to_name,
    jsonb_build_object(
      'message', p_message,
      'broadcast_id', v_broadcast_id::text,
      'title', p_title
    ),
    'pending'
  from recipients r;

  get diagnostics v_inserted = row_count;

  update public.broadcasts
  set total_recipients = v_inserted,
      enqueued_count = v_inserted
  where id = v_broadcast_id;

  return v_broadcast_id;
end;
$$;

-- 5) RPC: refresh broadcast stats from email_queue (optional but useful for UI)
create or replace function public.admin_refresh_broadcast_stats(p_broadcast_id uuid)
returns table(
  total int,
  pending int,
  sending int,
  sent int,
  failed int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.is_admin(v_uid) then
    raise exception 'Admin only';
  end if;

  return query
  select
    count(*)::int as total,
    count(*) filter (where status='pending')::int as pending,
    count(*) filter (where status='sending')::int as sending,
    count(*) filter (where status='sent')::int as sent,
    count(*) filter (where status='failed')::int as failed
  from public.email_queue
  where broadcast_id = p_broadcast_id;

  -- also persist into broadcasts table (so UI cepat)
  update public.broadcasts b
  set sent_count = s.sent,
      failed_count = s.failed
  from (
    select
      count(*) filter (where status='sent')::int as sent,
      count(*) filter (where status='failed')::int as failed
    from public.email_queue
    where broadcast_id = p_broadcast_id
  ) s
  where b.id = p_broadcast_id;
end;
$$;

-- 6) RLS policies for broadcasts (admin-only)
alter table public.broadcasts enable row level security;

do $$
begin
  -- SELECT
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='broadcasts' and policyname='broadcasts_select_admin') then
    create policy broadcasts_select_admin
    on public.broadcasts
    for select
    using (public.is_admin(auth.uid()));
  end if;

  -- INSERT
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='broadcasts' and policyname='broadcasts_insert_admin') then
    create policy broadcasts_insert_admin
    on public.broadcasts
    for insert
    with check (public.is_admin(auth.uid()));
  end if;

  -- UPDATE
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='broadcasts' and policyname='broadcasts_update_admin') then
    create policy broadcasts_update_admin
    on public.broadcasts
    for update
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));
  end if;
end $$;

commit;

-- Quick sanity: last broadcasts
select id, title, status, total_recipients, sent_count, failed_count, created_at
from public.broadcasts
order by created_at desc
limit 10;
