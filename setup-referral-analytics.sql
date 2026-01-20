-- STEP A: CHECK KOLOM YANG ADA DI profiles
select column_name
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by column_name;

-- STEP B: BUAT FUNCTION RPC: get_my_referral_analytics()
create or replace function public.get_my_referral_analytics()
returns table (
  my_referral_code text,
  total_invited integer,
  total_verified integer,
  total_pending integer,
  latest_invites jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  my_code text;
begin
  -- ambil referral_code milik user login
  select p.referral_code
  into my_code
  from public.profiles p
  where p.id = auth.uid();

  -- kalau belum ada kode, return nol semua (frontend tetap aman)
  if my_code is null or my_code = '' then
    my_referral_code := null;
    total_invited := 0;
    total_verified := 0;
    total_pending := 0;
    latest_invites := '[]'::jsonb;
    return next;
    return;
  end if;

  -- HITUNG TOTAL INVITED berdasarkan kolom referred_by
  -- NOTE: jika kolom referred_by tidak ada, nanti kita ganti di langkah C.
  select
    count(*)::int,
    count(*) filter (where coalesce(p.verified,false) = true)::int,
    count(*) filter (where coalesce(p.verified,false) = false)::int
  into
    total_invited,
    total_verified,
    total_pending
  from public.profiles p
  where p.referred_by = my_code;

  -- LIST INVITE TERBARU (maks 10)
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'email', p.email,
        'verified', coalesce(p.verified,false),
        'created_at', p.created_at
      )
      order by p.created_at desc
    ),
    '[]'::jsonb
  )
  into latest_invites
  from (
    select *
    from public.profiles
    where referred_by = my_code
    order by created_at desc
    limit 10
  ) p;

  my_referral_code := my_code;
  return next;
end;
$$;

-- STEP D: PERMISSION EXECUTE (PENTING)
revoke all on function public.get_my_referral_analytics() from public;
grant execute on function public.get_my_referral_analytics() to authenticated;

-- STEP E: RELOAD SCHEMA CACHE (BIAR 404 HILANG)
select pg_notify('pgrst', 'reload schema');

-- STEP F: TEST DATA (Opsional)
-- Cek referral_code kamu:
-- select id, email, referral_code from public.profiles where email is not null order by updated_at desc limit 5;

-- Test function (jika referral_code sudah ada):
-- select * from public.get_my_referral_analytics();
