-- =====================================================
-- INSERT TEST EMAIL FOR BANG EKO
-- =====================================================

-- Insert welcome email template for user Bang Eko
insert into public.email_queue (
  template_type, lang, to_email, to_name, payload, status
) values (
  'welcome',
  'id',
  'EMAIL_KAMU@GMAIL.COM',
  'Bang Eko',
  '{}'::jsonb,
  'pending'
);

-- Verify insertion
select 
  id,
  template_type,
  lang,
  to_email,
  to_name,
  status,
  created_at
from public.email_queue
where to_email = 'EMAIL_KAMU@GMAIL.COM'
order by created_at desc;
