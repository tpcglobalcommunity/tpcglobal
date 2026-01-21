-- =====================================================
-- NOTIFICATION AND EMAIL HELPER FUNCTIONS
-- =====================================================

-- Push notification helper
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

-- Email queue helper
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
-- ADMIN NOTIFICATION HELPERS
-- =====================================================

-- Helper to send notification to all admins
create or replace function public.notify_admins(
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
  select p_user_id, p_type, p_title, p_body, coalesce(p_payload,'{}'::jsonb)
  from public.profiles
  where role in ('admin', 'super_admin')
    and status = 'ACTIVE';
end;
$$;

grant execute on function public.notify_admins(text, text, text, jsonb) to authenticated;

-- Helper to send notification to specific user with admin audit
create or replace function public.admin_notify_user(
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
  -- Log the notification action
  perform public.log_admin_action(
    'ADMIN_SEND_NOTIFICATION',
    auth.uid(),
    jsonb_build_object(
      'target_user_id', p_user_id,
      'type', p_type,
      'title', p_title,
      'sent_at', now()
    )
  );

  -- Send the notification
  insert into public.notifications(user_id, type, title, body, payload)
  values (p_user_id, p_type, p_title, p_body, coalesce(p_payload,'{}'::jsonb));
end;
$$;

grant execute on function public.admin_notify_user(uuid, text, text, text, jsonb) to authenticated;

-- Helper to send email to user with admin audit
create or replace function public.admin_email_user(
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
  -- Log the email action
  perform public.log_admin_action(
    'ADMIN_QUEUE_EMAIL',
    auth.uid(),
    jsonb_build_object(
      'to_email', p_to_email,
      'subject', p_subject,
      'template', p_template,
      'queued_at', now()
    )
  );

  -- Queue the email
  insert into public.email_queue(to_email, subject, template, variables)
  values (p_to_email, p_subject, p_template, coalesce(p_variables,'{}'::jsonb));
end;
$$;

grant execute on function public.admin_email_user(text, text, text, jsonb) to authenticated;
