-- =====================================================
-- SIMPLE QUEUE EMAIL FUNCTION
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
begin
  if p_user_id is not null then
    select language into v_lang
    from public.profiles
    where id = p_user_id;
  end if;

  insert into public.email_queue(to_email, subject, template, variables, lang)
  values (p_to_email, p_subject, p_template, coalesce(p_variables,'{}'::jsonb), coalesce(v_lang,'en'));
end;
$$;

grant execute on function public.queue_email(text, text, text, jsonb, uuid) to authenticated;
