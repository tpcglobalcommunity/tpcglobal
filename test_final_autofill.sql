-- =====================================================
-- TEST FINAL AUTOFILL TRIGGER
-- =====================================================

-- Insert welcome email template for user Bang Eko
-- This will test the final autofill trigger that fills both template and subject columns
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

-- Verify insertion and autofill results
select 
  id,
  template_type,
  template,  -- Legacy column (should be filled by trigger)
  lang,
  to_email,
  to_name,
  subject,   -- Legacy column (should be filled by trigger)
  status,
  created_at
from public.email_queue
where to_email = 'EMAIL_KAMU@GMAIL.COM'
order by created_at desc;
