-- =====================================================
-- REFRESH BROADCAST STATISTICS
-- =====================================================

-- Refresh broadcast statistics from email queue
-- Replace PASTE_BROADCAST_ID_DISINI with actual broadcast ID

-- Get broadcast statistics
select 
  total,
  pending,
  sending,
  sent,
  failed
from public.admin_refresh_broadcast_stats('PASTE_BROADCAST_ID_DISINI');

-- Get broadcast details
select 
  id,
  title,
  status,
  total_recipients,
  enqueued_count,
  sent_count,
  failed_count,
  created_at,
  updated_at
from public.broadcasts
where id = 'PASTE_BROADCAST_ID_DISINI';

-- Get email queue breakdown
select 
  status,
  count(*) as count,
  array_agg(to_email order by to_email) as sample_emails
from public.email_queue
where broadcast_id = 'PASTE_BROADCAST_ID_DISINI'
group by status
order by 
  case status
    when 'pending' then 1
    when 'sending' then 2
    when 'sent' then 3
    when 'failed' then 4
    else 5
  end;
