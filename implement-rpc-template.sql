-- Template implementasi get_my_referral_analytics dengan deteksi tabel otomatis
-- Sesuaikan dengan tabel referral yang ditemukan

create or replace function public.get_my_referral_analytics()
returns table (
  referral_code text,
  total_referrals bigint,
  last_7_days bigint,
  last_30_days bigint,
  invite_status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  code text;
  referral_table_name text;
  referrer_col_name text;
  referrer_col_type text;
  has_created_at boolean := false;
  total_count bigint := 0;
  count_7d bigint := 0;
  count_30d bigint := 0;
  has_can_invite boolean := false;
begin
  -- Ambil referral_code dari profiles
  select p.referral_code into code
  from public.profiles p
  where p.id = uid;

  -- Default jika belum ada
  referral_code := coalesce(code, '');
  invite_status := 'ACTIVE';

  -- Deteksi tabel referral tracking yang ada
  -- Cek urutan prioritas: referrals > invites > referral_events
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='referrals'
  ) then
    referral_table_name := 'referrals';
  elsif exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='invites'
  ) then
    referral_table_name := 'invites';
  elsif exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='referral_events'
  ) then
    referral_table_name := 'referral_events';
  else
    referral_table_name := null;
  end if;

  -- Jika ada tabel referral tracking, hitung
  if referral_table_name is not null then
    -- Deteksi kolom referrer dan tipe data
    -- Cek kolom referrer_id (uuid)
    if exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='referrer_id'
    ) then
      referrer_col_name := 'referrer_id';
      select data_type into referrer_col_type
      from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='referrer_id';
    
    -- Cek kolom referrer_code (text)
    elsif exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='referrer_code'
    ) then
      referrer_col_name := 'referrer_code';
      select data_type into referrer_col_type
      from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='referrer_code';
    
    -- Cek kolom invited_by (uuid)
    elsif exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='invited_by'
    ) then
      referrer_col_name := 'invited_by';
      select data_type into referrer_col_type
      from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='invited_by';
    
    -- Cek kolom referred_by (uuid) di profiles sebagai fallback
    elsif exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name='profiles' 
        and column_name='referred_by'
    ) then
      referral_table_name := 'profiles';
      referrer_col_name := 'referred_by';
      select data_type into referrer_col_type
      from information_schema.columns
      where table_schema='public' 
        and table_name='profiles' 
        and column_name='referred_by';
    
    -- Cek kolom referred_by_code (text) di profiles
    elsif exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name='profiles' 
        and column_name='referred_by_code'
    ) then
      referral_table_name := 'profiles';
      referrer_col_name := 'referred_by_code';
      select data_type into referrer_col_type
      from information_schema.columns
      where table_schema='public' 
        and table_name='profiles' 
        and column_name='referred_by_code';
    end if;

    -- Cek apakah ada kolom created_at
    select exists (
      select 1 from information_schema.columns
      where table_schema='public' 
        and table_name=referral_table_name 
        and column_name='created_at'
    ) into has_created_at;

    -- Hitung referrals berdasarkan tipe kolom
    if referrer_col_name is not null then
      -- Dynamic query based on column type and table
      if referrer_col_type = 'uuid' then
        -- UUID comparison: referrer_id = uid
        if has_created_at then
          -- Dengan created_at
          execute format('
            select count(*)::bigint, 
                   count(*) filter (where created_at >= now() - interval ''7 days'')::bigint,
                   count(*) filter (where created_at >= now() - interval ''30 days'')::bigint
            from %I 
            where %I = $1',
            referral_table_name, referrer_col_name
          ) into total_count, count_7d, count_30d
          using uid;
        else
          -- Tanpa created_at
          execute format('
            select count(*)::bigint, 0::bigint, 0::bigint
            from %I 
            where %I = $1',
            referral_table_name, referrer_col_name
          ) into total_count, count_7d, count_30d
          using uid;
        end if;
      
      elsif referrer_col_type = 'text' then
        -- Text comparison: referrer_code = uid::text
        if has_created_at then
          -- Dengan created_at
          execute format('
            select count(*)::bigint,
                   count(*) filter (where created_at >= now() - interval ''7 days'')::bigint,
                   count(*) filter (where created_at >= now() - interval ''30 days'')::bigint
            from %I 
            where %I = $1',
            referral_table_name, referrer_col_name
          ) into total_count, count_7d, count_30d
          using uid::text;
        else
          -- Tanpa created_at
          execute format('
            select count(*)::bigint, 0::bigint, 0::bigint
            from %I 
            where %I = $1',
            referral_table_name, referrer_col_name
          ) into total_count, count_7d, count_30d
          using uid::text;
        end if;
      end if;
    end if;
  end if;

  -- Set nilai return
  total_referrals := coalesce(total_count, 0);
  last_7_days := coalesce(count_7d, 0);
  last_30_days := coalesce(count_30d, 0);

  -- Get invite status if column exists
  select exists (
    select 1 from information_schema.columns
    where table_schema='public' 
      and table_name='profiles' 
      and column_name='can_invite'
  ) into has_can_invite;

  if has_can_invite then
    select 
      case 
        when can_invite = true then 'ACTIVE'
        when can_invite = false then 'INACTIVE'
        else 'ACTIVE'
      end into invite_status
    from public.profiles
    where id = uid;
  end if;

  return next;
end;
$$;

-- Grant permissions
revoke all on function public.get_my_referral_analytics() from public;
grant execute on function public.get_my_referral_analytics() to authenticated;

-- Reload schema cache
select pg_notify('pgrst', 'reload schema');

-- Verification
select 'Function implemented successfully' as status;

-- Check function
select 
  proname as function_name,
  pg_get_function_identity_arguments(oid) as arguments
from pg_proc 
where proname = 'get_my_referral_analytics';
