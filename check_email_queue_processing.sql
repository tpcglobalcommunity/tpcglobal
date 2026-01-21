-- =====================================================
-- CHECK EMAIL QUEUE PROCESSING STATUS
-- =====================================================

-- Query to check email queue processing status with focus on attempts, errors, and timing
select 
  id,
  status,
  attempts,
  last_error,
  sent_at,
  created_at
from public.email_queue
order by created_at desc
limit 5;
