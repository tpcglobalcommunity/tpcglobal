-- =====================================================
-- CHECK EMAIL QUEUE DETAILED STATUS
-- =====================================================

-- Query to check recent email queue entries with full details including attempts and errors
select 
  id,
  status,
  to_email,
  lang,
  template_type,
  template,  -- Legacy column filled by autofill trigger
  subject,   -- Legacy column filled by autofill trigger
  attempts,
  last_error,
  created_at
from public.email_queue
order by created_at desc
limit 5;
