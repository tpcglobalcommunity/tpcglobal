-- =========================================================
-- 1) Seed distribution split settings (editable)
-- =========================================================
insert into public.app_settings(key, value)
values (
  'distribution_split',
  jsonb_build_object(
    'referral', 0.10,
    'treasury', 0.20,
    'buyback',  0.05
  )
)
on conflict (key) do nothing;

-- =========================================================
-- 2) RLS for app_settings (read limited, write admin/service)
-- =========================================================
alter table public.app_settings enable row level security;

-- Allow anon/authenticated to read ONLY public keys
drop policy if exists "settings_public_read" on public.app_settings;
create policy "settings_public_read"
on public.app_settings
for select
using (key in ('public_wallets')); -- only wallets are public

-- Admin can read all settings
drop policy if exists "settings_admin_read_all" on public.app_settings;
create policy "settings_admin_read_all"
on public.app_settings
for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

-- Service role can do anything (Edge)
drop policy if exists "settings_service_all" on public.app_settings;
create policy "settings_service_all"
on public.app_settings
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Admin update via RPC only (no direct update from client)
-- (optional) keep direct update blocked by not granting update policy for authenticated
-- We intentionally DO NOT add an "admin update" policy here.

-- =========================================================
-- 3) RPC: get distribution split (admin only)
-- =========================================================
create or replace function public.admin_get_distribution_split()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  return coalesce(
    (select value from public.app_settings where key='distribution_split'),
    '{}'::jsonb
  );
end;
$$;

-- =========================================================
-- 4) RPC: set distribution split (admin only, validated)
-- =========================================================
create or replace function public.admin_set_distribution_split(
  p_referral numeric,
  p_treasury numeric,
  p_buyback numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s numeric;
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'forbidden';
  end if;

  if p_referral < 0 or p_treasury < 0 or p_buyback < 0 then
    raise exception 'invalid: negative split';
  end if;

  s := p_referral + p_treasury + p_buyback;

  -- allow <= 1.00 so sisanya bisa dianggap "ops/fees/liquidity" nanti
  if s > 1.00 then
    raise exception 'invalid: split sum > 1.00';
  end if;

  insert into public.app_settings(key, value)
  values (
    'distribution_split',
    jsonb_build_object(
      'referral', p_referral,
      'treasury', p_treasury,
      'buyback',  p_buyback
    )
  )
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();

  return jsonb_build_object(
    'ok', true,
    'split', (select value from public.app_settings where key='distribution_split'),
    'sum', s
  );
end;
$$;

grant execute on function public.admin_get_distribution_split() to authenticated;
grant execute on function public.admin_set_distribution_split(numeric, numeric, numeric) to authenticated;
