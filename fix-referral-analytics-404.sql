-- STEP 2: HAPUS SEMUA VERSI FUNCTION YANG MUNGKIN BENTROK
drop function if exists public.get_my_referral_analytics();
drop function if exists public.get_my_referral_analytics(json);
drop function if exists public.get_my_referral_analytics(uuid);
drop function if exists public.get_my_referral_analytics(text);

-- STEP 3: BUAT FUNCTION PASTI TANPA PARAMETER (signature exact)
create or replace function public.get_my_referral_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  my_code text;
  total_invited int := 0;
  total_verified int := 0;
  total_pending int := 0;
  latest_invites jsonb := '[]'::jsonb;
begin
  select p.referral_code
  into my_code
  from public.profiles p
  where p.id = auth.uid();

  if my_code is null or my_code = '' then
    return json_build_object(
      'my_referral_code', null,
      'total_invited', 0,
      'total_verified', 0,
      'total_pending', 0,
      'latest_invites', jsonb_build_array()
    );
  end if;

  -- IMPORTANT:
  -- Jika kolom "referred_by" tidak ada, GANTI "referred_by" di bawah sesuai nama kolom yang menyimpan kode inviter.
  select
    count(*)::int,
    count(*) filter (where coalesce(p.verified,false) = true)::int,
    count(*) filter (where coalesce(p.verified,false) = false)::int
  into total_invited, total_verified, total_pending
  from public.profiles p
  where p.referred_by = my_code;

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

  return json_build_object(
    'my_referral_code', my_code,
    'total_invited', total_invited,
    'total_verified', total_verified,
    'total_pending', total_pending,
    'latest_invites', latest_invites
  );
end;
$$;

-- STEP 4: PERMISSION (WAJIB)
revoke all on function public.get_my_referral_analytics() from public;
grant execute on function public.get_my_referral_analytics() to authenticated;

-- STEP 5: RELOAD SCHEMA CACHE (WAJIB)
select pg_notify('pgrst', 'reload schema');

-- STEP 6: BUKTI FUNCTION SUDAH TERDAFTAR
select
  n.nspname as schema,
  p.proname as name,
  pg_get_function_identity_arguments(p.oid) as args,
  pg_get_function_result(p.oid) as returns
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public' and p.proname='get_my_referral_analytics';

-- STEP 7: CHECK KOLOM (JIKA ERROR referred_by)
select column_name
from information_schema.columns
where table_schema='public' and table_name='profiles'
order by column_name;
