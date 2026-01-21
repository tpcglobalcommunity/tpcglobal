-- =====================================================
-- CHECK EMAIL QUEUE COMPLETE STATUS
-- =====================================================

-- Query to check email queue with complete details including recipient and subject
select 
  id,
  status,
  attempts,
  last_error,
  sent_at,
  to_email,
  subject,
  created_at
from public.email_queue
order by created_at desc
limit 5;
