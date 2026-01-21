-- =====================================================
-- RESET, INSERT TEST, AND MONITOR EMAIL QUEUE
-- =====================================================

-- 1) Reset semua yang nyangkut jadi pending (biar bisa dicoba lagi)
update public.email_queue
set status = 'pending', last_error = null
where status in ('failed','sending');

-- 2) Masukkan 1 email test terbaru (ganti email kamu beneran)
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

-- 3) Lihat 3 antrian terbaru (pastikan pending)
select id, status, attempts, last_error, to_email, template_type, template, subject, created_at
from public.email_queue
order by created_at desc
limit 3;
