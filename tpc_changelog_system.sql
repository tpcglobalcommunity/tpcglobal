-- =========================================================
-- PUBLIC CHANGELOG (SAFE, NO PII)
-- Tracks changes for selected keys only
-- =========================================================
create table if not exists public.tpc_settings_changelog (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid, -- stored for internal audit (NOT exposed publicly)
  old_value jsonb,
  new_value jsonb,
  summary text not null default ''
);

create index if not exists idx_changelog_key_time
on public.tpc_settings_changelog(key, changed_at desc);

alter table public.tpc_settings_changelog enable row level security;

-- Public can read changelog rows (safe fields only via RPC; direct select still ok but safer to use RPC)
drop policy if exists "changelog_no_direct_select" on public.tpc_settings_changelog;
create policy "changelog_no_direct_select"
on public.tpc_settings_changelog
for select
using (false); -- block direct table reads (force RPC)

-- Service role can write
drop policy if exists "changelog_service_write" on public.tpc_settings_changelog;
create policy "changelog_service_write"
on public.tpc_settings_changelog
for insert
with check (auth.role() = 'service_role');

-- =========================================================
-- Trigger: log changes on app_settings for keys we care about
-- (distribution_split + public_wallets)
-- =========================================================
create or replace function public._changelog_app_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  k text;
  s text;
begin
  k := new.key;

  -- only track selected keys
  if k not in ('distribution_split', 'public_wallets') then
    return new;
  end if;

  -- build safe summary (public-facing text)
  if k = 'distribution_split' then
    s := 'distribution_split updated: '
      || 'referral=' || coalesce((new.value->>'referral')::text, 'n/a')
      || ', treasury=' || coalesce((new.value->>'treasury')::text, 'n/a')
      || ', buyback=' || coalesce((new.value->>'buyback')::text, 'n/a');
  elsif k = 'public_wallets' then
    s := 'public_wallets updated';
  else
    s := k || ' updated';
  end if;

  insert into public.tpc_settings_changelog(key, changed_by, old_value, new_value, summary)
  values (
    k,
    auth.uid(),         -- invoker uid (admin) when changed via RPC; may be null in service context
    to_jsonb(old),
    to_jsonb(new),
    s
  );

  return new;
end;
$$;

drop trigger if exists trg_changelog_app_settings on public.app_settings;
create trigger trg_changelog_app_settings
after update on public.app_settings
for each row
execute function public._changelog_app_settings();

-- =========================================================
-- PUBLIC RPC: returns SAFE changelog (NO changed_by, NO raw values)
-- =========================================================
create or replace function public.get_public_changelog(p_limit int default 20)
returns table(
  changed_at timestamptz,
  key text,
  summary text
)
language sql
security definer
set search_path = public
as $$
  select
    c.changed_at,
    c.key,
    c.summary
  from public.tpc_settings_changelog c
  order by c.changed_at desc
  limit greatest(p_limit, 1);
$$;

grant execute on function public.get_public_changelog(int) to anon, authenticated;
