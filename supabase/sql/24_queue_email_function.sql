-- =====================================================
-- QUEUE EMAIL FUNCTION WITH LANGUAGE SUPPORT
-- =====================================================

-- Queue email with automatic language detection
create or replace function public.queue_email(
  p_to_email text,
  p_subject text,
  p_template text,
  p_variables jsonb default '{}'::jsonb,
  p_user_id uuid default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text := 'en';
  v_user_email text;
begin
  -- Get user's preferred language if user_id provided
  if p_user_id is not null then
    select language into v_lang
    from public.profiles
    where id = p_user_id;
  end if;

  -- Get user email for logging
  if p_user_id is not null then
    select email into v_user_email
    from public.profiles
    where id = p_user_id;
  end if;

  -- Insert email into queue with user's language preference
  insert into public.email_queue(
    to_email, 
    subject, 
    template, 
    variables, 
    lang,
    created_at,
    next_attempt_at,
    attempt_count,
    status,
    last_error,
    provider_message_id
  ) values (
    p_to_email, 
    p_subject, 
    p_template, 
    coalesce(p_variables,'{}'::jsonb), 
    coalesce(v_lang,'en'),
    now(),
    now(),
    0,
    'PENDING',
    null,
    null
  );

  -- Log email queuing action
  perform public.log_admin_action(
    'EMAIL_QUEUED',
    p_to_email,
    jsonb_build_object(
      'template', p_template,
      'subject', p_subject,
      'user_id', p_user_id,
      'user_email', v_user_email,
      'language', v_lang,
      'variables', p_variables,
      'queued_at', now()
    )
  );
end;
$$;

grant execute on function public.queue_email(text, text, text, jsonb, uuid) to authenticated;

-- =====================================================
-- QUEUE EMAIL FOR MULTIPLE USERS
-- =====================================================

-- Queue email for multiple users with individual language preferences
create or replace function public.queue_email_bulk(
  p_user_ids uuid[],
  p_subject text,
  p_template text,
  p_variables jsonb default '{}'::jsonb
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  v_user_record record;
begin
  -- Insert emails for each user with their language preference
  for v_user_record in 
    select 
      p.id as user_id,
      p.email as user_email,
      coalesce(p.language, 'en') as lang
    from public.profiles p
    where p.id = any(p_user_ids)
  loop
    insert into public.email_queue(
      to_email, 
      subject, 
      template, 
      variables, 
      lang,
      created_at,
      next_attempt_at,
      attempt_count,
      status,
      last_error,
      provider_message_id
    ) values (
      v_user_record.user_email, 
      p_subject, 
      p_template, 
      p_variables, 
      v_user_record.lang,
      now(),
      now(),
      0,
      'PENDING',
      null,
      null
    );
    
    v_count := v_count + 1;
  end loop;

  -- Log bulk email queuing action
  perform public.log_admin_action(
    'EMAIL_BULK_QUEUED',
    null,
    jsonb_build_object(
      'template', p_template,
      'subject', p_subject,
      'user_count', v_count,
      'user_ids', p_user_ids,
      'variables', p_variables,
      'queued_at', now()
    )
  );

  return v_count;
end;
$$;

grant execute on function public.queue_email_bulk(uuid[], text, text, jsonb) to authenticated;

-- =====================================================
-- QUEUE EMAIL WITH SPECIFIC LANGUAGE
-- =====================================================

-- Queue email with explicit language override
create or replace function public.queue_email_with_lang(
  p_to_email text,
  p_subject text,
  p_template text,
  p_variables jsonb default '{}'::jsonb,
  p_lang text default 'en'
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Validate language
  if p_lang not in ('en', 'id', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'th', 'vi') then
    raise exception 'invalid language: %', p_lang;
  end if;

  -- Insert email into queue with specified language
  insert into public.email_queue(
    to_email, 
    subject, 
    template, 
    variables, 
    lang,
    created_at,
    next_attempt_at,
    attempt_count,
    status,
    last_error,
    provider_message_id
  ) values (
    p_to_email, 
    p_subject, 
    p_template, 
    coalesce(p_variables,'{}'::jsonb), 
    p_lang,
    now(),
    now(),
    0,
    'PENDING',
    null,
    null
  );

  -- Log email queuing action with language override
  perform public.log_admin_action(
    'EMAIL_QUEUED_WITH_LANG',
    p_to_email,
    jsonb_build_object(
      'template', p_template,
      'subject', p_subject,
      'language', p_lang,
      'variables', p_variables,
      'queued_at', now()
    )
  );
end;
$$;

grant execute on function public.queue_email_with_lang(text, text, text, jsonb, text) to authenticated;

-- =====================================================
-- QUEUE EMAIL FOR NOTIFICATION
-- =====================================================

-- Queue email from notification system
create or replace function public.queue_notification_email(
  p_user_id uuid,
  p_notification_type text,
  p_title text,
  p_body text,
  p_variables jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_email text;
  v_lang text := 'en';
  v_subject text;
begin
  -- Get user email and language preference
  select email, language into v_user_email, v_lang
  from public.profiles
  where id = p_user_id;

  -- Generate subject based on notification type
  v_subject := case p_notification_type
    when 'VERIFICATION_APPROVED' then 'Verification Approved'
    when 'VERIFICATION_REJECTED' then 'Verification Rejected'
    when 'ACCOUNT_UPDATED' then 'Account Updated'
    when 'SYSTEM_ALERT' then 'System Alert'
    else 'Notification'
  end;

  -- Insert notification email into queue
  insert into public.email_queue(
    to_email, 
    subject, 
    template, 
    variables, 
    lang,
    created_at,
    next_attempt_at,
    attempt_count,
    status,
    last_error,
    provider_message_id
  ) values (
    v_user_email, 
    v_subject, 
    p_notification_type, 
    jsonb_build_object(
      'title', p_title,
      'body', p_body,
      'notification_type', p_notification_type,
      'user_id', p_user_id
    ) || p_variables, 
    coalesce(v_lang,'en'),
    now(),
    now(),
    0,
    'PENDING',
    null,
    null
  );

  -- Log notification email queuing
  perform public.log_admin_action(
    'NOTIFICATION_EMAIL_QUEUED',
    v_user_email,
    jsonb_build_object(
      'notification_type', p_notification_type,
      'title', p_title,
      'user_id', p_user_id,
      'language', v_lang,
      'variables', p_variables,
      'queued_at', now()
    )
  );
end;
$$;

grant execute on function public.queue_notification_email(uuid, text, text, text, jsonb) to authenticated;
