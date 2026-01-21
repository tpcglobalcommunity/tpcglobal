-- =====================================================
-- FIX: EMAIL_QUEUE TRIGGER ONLY FILLS SUBJECT
-- Safe and idempotent - body_text/body_html columns don't exist
-- =====================================================

create or replace function public.email_queue_autofill_subject_only()
returns trigger
language plpgsql
as $$
declare
  tpl record;
  v_name text;
  v_app_url text := 'https://tpcglobal.io'; -- fallback
begin
  if new.template_type is null or btrim(new.template_type) = '' then
    new.template_type := 'announcement';
  end if;

  if new.lang is null or btrim(new.lang) = '' then
    new.lang := 'en';
  end if;

  v_name := coalesce(new.to_name, 'Member');

  -- get template (fallback EN handled by get_email_template)
  select * into tpl
  from public.get_email_template(new.template_type, new.lang)
  limit 1;

  -- fill subject to satisfy NOT NULL
  if new.subject is null or btrim(new.subject) = '' then
    if tpl is not null and tpl.subject is not null then
      new.subject := tpl.subject;
    else
      new.subject := 'TPC Global';
    end if;
  end if;

  -- render placeholders in subject
  new.subject := regexp_replace(new.subject, '\{\{\s*name\s*\}\}', v_name, 'g');
  new.subject := regexp_replace(new.subject, '\{\{\s*app_url\s*\}\}', v_app_url, 'g');

  return new;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_email_queue_autofill_legacy') then
    drop trigger trg_email_queue_autofill_legacy on public.email_queue;
  end if;

  if exists (select 1 from pg_trigger where tgname = 'trg_email_queue_autofill_subject_only') then
    drop trigger trg_email_queue_autofill_subject_only on public.email_queue;
  end if;

  create trigger trg_email_queue_autofill_subject_only
  before insert on public.email_queue
  for each row
  execute function public.email_queue_autofill_subject_only();
end $$;
