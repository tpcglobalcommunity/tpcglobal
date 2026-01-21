-- =====================================================
-- RESET FAILED EMAILS TO PENDING
-- =====================================================

-- Reset failed emails back to pending status for retry
update public.email_queue
set status='pending', last_error=null
where status='failed';

-- Verify the reset
select 
  status,
  count(*) as total
from public.email_queue
group by status
order by status;
