-- =====================================================
-- CHECK EMAIL QUEUE STATUS
-- =====================================================

-- Query to check recent email queue entries
select 
  id,
  template_type,
  lang,
  to_email,
  status,
  attempts,
  last_error,
  sent_at,
  created_at
from public.email_queue
order by created_at desc
limit 20;
