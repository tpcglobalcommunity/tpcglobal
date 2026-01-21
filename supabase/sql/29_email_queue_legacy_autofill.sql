-- =====================================================
-- BACKWARD COMPATIBLE: AUTO-FILL LEGACY EMAIL_QUEUE FIELDS
-- Works even if email_queue already has subject/body NOT NULL
-- =====================================================

create or replace function public.email_queue_autofill_legacy_fields()
returns trigger
language plpgsql
as $$
declare
  tpl record;
  v_name text;
  v_app_url text := 'https://tpcglobal.io'; -- fallback
  v_verify_url text;
  v_reset_url text;
  v_message text;
begin
  -- normalize
  if new.template_type is null or btrim(new.template_type) = '' then
    new.template_type := 'announcement';
  end if;
  if new.lang is null or btrim(new.lang) = '' then
    new.lang := 'en';
  end if;

  -- fetch template (fallback en handled by function)
  select * into tpl
  from public.get_email_template(new.template_type, new.lang)
  limit 1;

  if tpl is null then
    -- hard fallback to avoid NOT NULL fail
    new.subject := coalesce(new.subject, 'TPC Global');
    new.body_text := coalesce(new.body_text, 'Hello from TPC Global');
    new.body_html := coalesce(new.body_html, '<p>Hello from TPC Global</p>');
    return new;
  end if;

  v_name := coalesce(new.to_name, 'Member');

  -- payload vars
  v_verify_url := coalesce(new.payload->>'verify_url','');
  v_reset_url  := coalesce(new.payload->>'reset_url','');
  v_message    := coalesce(new.payload->>'message','');

  -- render placeholders
  new.subject := coalesce(new.subject, tpl.subject);
  new.subject := regexp_replace(new.subject, '\{\{\s*name\s*\}\}', v_name, 'g');
  new.subject := regexp_replace(new.subject, '\{\{\s*app_url\s*\}\}', v_app_url, 'g');

  new.body_text := coalesce(new.body_text, tpl.body_text);
  new.body_text := regexp_replace(new.body_text, '\{\{\s*name\s*\}\}', v_name, 'g');
  new.body_text := regexp_replace(new.body_text, '\{\{\s*app_url\s*\}\}', v_app_url, 'g');
  new.body_text := regexp_replace(new.body_text, '\{\{\s*verify_url\s*\}\}', v_verify_url, 'g');
  new.body_text := regexp_replace(new.body_text, '\{\{\s*reset_url\s*\}\}', v_reset_url, 'g');
  new.body_text := regexp_replace(new.body_text, '\{\{\s*message\s*\}\}', v_message, 'g');

  new.body_html := coalesce(new.body_html, tpl.body_html);
  new.body_html := regexp_replace(new.body_html, '\{\{\s*name\s*\}\}', v_name, 'g');
  new.body_html := regexp_replace(new.body_html, '\{\{\s*app_url\s*\}\}', v_app_url, 'g');
  new.body_html := regexp_replace(new.body_html, '\{\{\s*verify_url\s*\}\}', v_verify_url, 'g');
  new.body_html := regexp_replace(new.body_html, '\{\{\s*reset_url\s*\}\}', v_reset_url, 'g');
  new.body_html := regexp_replace(new.body_html, '\{\{\s*message\s*\}\}', v_message, 'g');

  return new;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'trg_email_queue_autofill_legacy') then
    drop trigger trg_email_queue_autofill_legacy on public.email_queue;
  end if;

  create trigger trg_email_queue_autofill_legacy
  before insert on public.email_queue
  for each row
  execute function public.email_queue_autofill_legacy_fields();
end $$;
