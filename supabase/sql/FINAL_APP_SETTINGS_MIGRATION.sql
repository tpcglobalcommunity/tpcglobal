begin;

-- 1) Table
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2) Ensure column exists (kalau table sudah ada tapi kolom belum ada)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='app_settings' and column_name='is_public'
  ) then
    alter table public.app_settings add column is_public boolean not null default false;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='app_settings' and column_name='value'
  ) then
    alter table public.app_settings add column value jsonb not null default '{}'::jsonb;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='app_settings' and column_name='updated_at'
  ) then
    alter table public.app_settings add column updated_at timestamptz not null default now();
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='app_settings' and column_name='created_at'
  ) then
    alter table public.app_settings add column created_at timestamptz not null default now();
  end if;
end $$;

-- 3) updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- 4) RLS
alter table public.app_settings enable row level security;

drop policy if exists "app_settings_public_read" on public.app_settings;
create policy "app_settings_public_read"
on public.app_settings
for select
to anon, authenticated
using (is_public = true);

-- 5) RPC: get_app_settings() -> jsonb (object)
create or replace function public.get_app_settings()
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
  from public.app_settings
  where is_public = true;
$$;

grant execute on function public.get_app_settings() to anon, authenticated;

-- 6) Seed minimal (opsional, tapi bagus biar endpoint ada output)
insert into public.app_settings (key, value, is_public)
values
  ('maintenance_mode', to_jsonb(false), true),
  ('site_name', to_jsonb('TPC Global'), true)
on conflict (key) do update
set value = excluded.value, is_public = excluded.is_public;

commit;
