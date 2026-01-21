-- =====================================================
-- EMAIL LANGUAGE SUPPORT
-- =====================================================

-- Add language column to email queue
alter table public.email_queue
add column if not exists lang text not null default 'en';

-- Create index for efficient language-based queries
create index if not exists email_queue_lang_idx
on public.email_queue (lang, status);

-- Add constraint for valid languages
alter table public.email_queue
add constraint email_queue_lang_check 
check (lang in ('en', 'id', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'th', 'vi'));

-- Update existing emails to have default language if null
update public.email_queue
set lang = 'en'
where lang is null;

-- =====================================================
-- EMAIL LANGUAGE FUNCTIONS
-- =====================================================

-- Get email queue statistics by language
create or replace function public.get_email_queue_lang_stats()
returns table (
  lang text,
  pending bigint,
  sent bigint,
  failed bigint,
  cancelled bigint,
  total bigint,
  success_rate numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    eq.lang,
    count(*) filter (where eq.status = 'PENDING')::bigint as pending,
    count(*) filter (where eq.status = 'SENT')::bigint as sent,
    count(*) filter (where eq.status = 'FAILED')::bigint as failed,
    count(*) filter (where eq.status = 'CANCELLED')::bigint as cancelled,
    count(*)::bigint as total,
    round(
      (count(*) filter (where eq.status = 'SENT')::float * 100.0 / 
       nullif(count(*)::float, 0)
      ), 2
    ) as success_rate
  from public.email_queue eq
  group by eq.lang
  order by total desc;
$$;

grant execute on function public.get_email_queue_lang_stats() to authenticated;

-- Get email queue details with language filtering
create or replace function public.admin_get_email_queue_by_lang(p_lang text default null)
returns table (
  id bigint,
  to_email text,
  subject text,
  template text,
  variables jsonb,
  status text,
  attempt_count int,
  created_at timestamptz,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  locked_at timestamp,
  locked_by text,
  lock_duration_minutes int,
  health_status text,
  provider_message_id text,
  lang text
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    q.id,
    q.to_email,
    q.subject,
    q.template,
    q.variables,
    q.status,
    q.attempt_count,
    q.created_at,
    q.next_attempt_at,
    q.last_attempt_at,
    q.last_error,
    q.locked_at,
    q.locked_by,
    q.lock_duration_minutes,
    q.health_status,
    q.provider_message_id,
    q.lang
  from public.email_queue q
  where (p_lang is null or q.lang = p_lang)
  order by q.created_at desc;
$$;

grant execute on function public.admin_get_email_queue_by_lang(text) to authenticated;

-- =====================================================
-- EMAIL TEMPLATE LANGUAGE FUNCTIONS
-- =====================================================

-- Get email template with language support
create or replace function public.get_email_template(p_template text, p_lang text default 'en')
returns table (
  subject text,
  body text,
  variables jsonb,
  lang text
)
language sql
stable
security definer
set search_path = public
as $$
  -- For now, return template info
  -- In future, this could query a localized_templates table
  select 
    p_template as subject,
    'Template content for ' || p_lang as body,
    '{}'::jsonb as variables,
    p_lang as lang;
$$;

grant execute on function public.get_email_template(text, text) to authenticated;

-- =====================================================
-- EMAIL LANGUAGE MIGRATION
-- =====================================================

-- Migrate existing emails to user's preferred language
create or replace function public.migrate_email_languages()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_migrated int;
begin
  -- Update emails with null language to default
  update public.email_queue
  set lang = 'en'
  where lang is null;
  
  get diagnostics v_migrated = row_count;
  return v_migrated;
end;
$$;

grant execute on function public.migrate_email_languages() to authenticated;

-- Update email language based on user preference
create or replace function public.update_email_language(p_email_id bigint, p_lang text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Validate language
  if p_lang not in ('en', 'id', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'th', 'vi') then
    raise exception 'invalid language';
  end if;

  -- Update email language
  update public.email_queue
  set lang = p_lang
  where id = p_email_id;

  -- Log language change
  perform public.log_admin_action(
    'EMAIL_LANGUAGE_UPDATE',
    p_email_id::text,
    jsonb_build_object(
      'email_id', p_email_id,
      'new_language', p_lang,
      'updated_at', now()
    )
  );

  return true;
end;
$$;

grant execute on function public.update_email_language(bigint, text) to authenticated;
