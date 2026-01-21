-- =====================================================
-- TEST ADMIN BROADCAST CENTER
-- =====================================================

-- Test broadcast creation with email queue integration
select public.admin_create_broadcast_and_enqueue(
  p_title      := 'TPC Global Update',
  p_message    := 'Halo! Ini test broadcast pertama dari Admin Control Center.',
  p_lang_mode  := 'auto',     -- auto / en / id
  p_target_role:= null,       -- null = semua
  p_verified_only := true,
  p_limit_n    := 10          -- test dulu 10, nanti null untuk semua
) as broadcast_id;

-- Verify broadcast creation
select 
  id as broadcast_id,
  title,
  status,
  total_recipients,
  enqueued_count,
  created_at
from public.broadcasts
where id = (
  select public.admin_create_broadcast_and_enqueue(
    p_title      := 'TPC Global Update',
    p_message    := 'Halo! Ini test broadcast pertama dari Admin Control Center.',
    p_lang_mode  := 'auto',
    p_target_role:= null,
    p_verified_only := true,
    p_limit_n    := 10
  ) as broadcast_id
);

-- Check enqueued emails
select 
  count(*) as total_enqueued,
  count(*) filter (where status='pending')::int as pending,
  count(*) filter (where status='sending')::int as sending,
  count(*) filter (where status='sent')::int as sent,
  count(*) filter (where status='failed')::int as failed
from public.email_queue
where broadcast_id = (
  select public.admin_create_broadcast_and_enqueue(
    p_title      := 'TPC Global Update',
    p_message    := 'Halo! Ini test broadcast pertama dari Admin Control Center.',
    p_lang_mode  := 'auto',
    p_target_role:= null,
    p_verified_only := true,
    p_limit_n    := 10
  ) as broadcast_id
);
