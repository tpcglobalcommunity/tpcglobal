-- =====================================================
-- CHECK EMAIL QUEUE STATUS
-- =====================================================

-- Query to check recent email queue entries with all relevant columns
select 
  id,
  status,
  to_email,
  lang,
  template_type,
  template,  -- Legacy column filled by autofill trigger
  subject,   -- Legacy column filled by autofill trigger
  created_at
from public.email_queue
order by created_at desc
limit 5;
