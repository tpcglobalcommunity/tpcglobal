-- =====================================================
-- AUTO-FILL EMAIL_QUEUE.LANG FROM PROFILES
-- =====================================================

do $$
begin
  -- 1) Ensure profiles has lang column (optional but recommended)
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'lang'
  ) then
    alter table public.profiles
      add column lang text not null default 'en';
  end if;

  -- 2) Create/replace helper function to resolve language for a user id
  create or replace function public.get_user_lang(p_user_id uuid)
  returns text
  language sql
  stable
  as $fn$
    select coalesce(
      (select nullif(trim(lower(p.lang)), '') from public.profiles p where p.id = p_user_id),
      'en'
    );
  $fn$;

  -- 3) Drop trigger if exists (idempotent)
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_email_queue_set_lang'
  ) then
    drop trigger trg_email_queue_set_lang on public.email_queue;
  end if;

  -- 4) Trigger function: set NEW.lang if null/empty
  create or replace function public.email_queue_set_lang()
  returns trigger
  language plpgsql
  as $tf$
  begin
    if new.lang is null or btrim(new.lang) = '' then
      -- Coba ambil dari kolom user_id jika ada
      if to_regclass('public.email_queue') is not null then
        -- Jika email_queue punya kolom user_id / profile_id, pakai yang ada
        if exists (
          select 1
          from information_schema.columns
          where table_schema='public' and table_name='email_queue' and column_name='user_id'
        ) then
          new.lang := public.get_user_lang(new.user_id);
        elsif exists (
          select 1
          from information_schema.columns
          where table_schema='public' and table_name='email_queue' and column_name='profile_id'
        ) then
          new.lang := public.get_user_lang(new.profile_id);
        else
          new.lang := 'en';
        end if;
      else
        new.lang := 'en';
      end if;
    end if;

    -- Normalisasi value (en/id)
    new.lang := lower(new.lang);

    return new;
  end;
  $tf$;

  -- 5) Create trigger
  create trigger trg_email_queue_set_lang
  before insert on public.email_queue
  for each row
  execute function public.email_queue_set_lang();

end $$;

-- Optional quick test (non-destructive): show columns
select
  table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public'
  and table_name in ('profiles','email_queue')
order by table_name, ordinal_position;
