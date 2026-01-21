-- =====================================================
-- USER LANGUAGE PREFERENCE
-- =====================================================

-- Add language preference column to profiles
alter table public.profiles
add column if not exists language text not null default 'en';

-- Create index for efficient language-based queries
create index if not exists profiles_language_idx
on public.profiles (language);

-- Update existing profiles to have default language if null
update public.profiles
set language = 'en'
where language is null;

-- Add constraint for valid languages
alter table public.profiles
add constraint profiles_language_check 
check (language in ('en', 'id', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'th', 'vi'));

-- =====================================================
-- LANGUAGE PREFERENCE FUNCTIONS
-- =====================================================

-- Get user language preference
create or replace function public.get_user_language(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select language from public.profiles where id = p_user_id;
$$;

grant execute on function public.get_user_language(uuid) to authenticated;

-- Update user language preference
create or replace function public.update_user_language(p_language text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Validate language
  if p_language not in ('en', 'id', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'hi', 'th', 'vi') then
    raise exception 'invalid language';
  end if;

  -- Update user's language preference
  update public.profiles
  set language = p_language,
      updated_at = now()
  where id = auth.uid();

  -- Log language change
  perform public.log_admin_action(
    'USER_LANGUAGE_UPDATE',
    auth.uid()::text,
    jsonb_build_object(
      'old_language', (select language from public.profiles where id = auth.uid()),
      'new_language', p_language,
      'updated_at', now()
    )
  );

  return true;
end;
$$;

grant execute on function public.update_user_language(text) to authenticated;

-- =====================================================
-- LANGUAGE STATISTICS
-- =====================================================

-- Get language usage statistics
create or replace function public.get_language_stats()
returns table (
  language text,
  count bigint,
  percentage numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    p.language,
    count(*)::bigint,
    round(
      (count(*)::float * 100.0 / 
       (select count(*)::float from public.profiles where language is not null)
      ), 2
    ) as percentage
  from public.profiles p
  where p.language is not null
  group by p.language
  order by count(*) desc;
$$;

grant execute on function public.get_language_stats() to authenticated;

-- =====================================================
-- LANGUAGE PREFERENCE MIGRATION
-- =====================================================

-- Migrate existing users to default language if needed
create or replace function public.migrate_user_languages()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_migrated int;
begin
  -- Update profiles with null language to default
  update public.profiles
  set language = 'en',
      updated_at = now()
  where language is null;
  
  get diagnostics v_migrated = row_count;
  return v_migrated;
end;
$$;

grant execute on function public.migrate_user_languages() to authenticated;

-- =====================================================
-- LANGUAGE SUPPORT FUNCTIONS
-- =====================================================

-- Get supported languages
create or replace function public.get_supported_languages()
returns table (
  code text,
  name text,
  native_name text,
  is_default boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select 
    code,
    name,
    native_name,
    (code = 'en') as is_default
  from (
    values 
      ('en', 'English', 'English'),
      ('id', 'Indonesian', 'Bahasa Indonesia'),
      ('zh', 'Chinese', '中文'),
      ('ja', 'Japanese', '日本語'),
      ('ko', 'Korean', '한국어'),
      ('es', 'Spanish', 'Español'),
      ('fr', 'French', 'Français'),
      ('de', 'German', 'Deutsch'),
      ('ru', 'Russian', 'Русский'),
      ('pt', 'Portuguese', 'Português'),
      ('ar', 'Arabic', 'العربية'),
      ('hi', 'Hindi', 'हिन्दी'),
      ('th', 'Thai', 'ไทย'),
      ('vi', 'Vietnamese', 'Tiếng Việt')
  ) as languages(code, name, native_name)
  order by 
    case when code = 'en' then 0 else 1 end,
    name;
$$;

grant execute on function public.get_supported_languages() to authenticated;
