-- ================================
-- I) ADMIN SETTINGS (GLOBAL CONFIG) + SECURE RPC + AUDIT LOG
-- Requires: is_admin(), admin_audit_log (from Step D)
-- ================================

begin;

-- 1) Global settings table (single-row pattern)
create table if not exists public.app_settings (
  id                int primary key default 1,
  updated_at        timestamptz not null default now(),
  updated_by        uuid,

  maintenance_mode  boolean not null default false,
  registrations_open boolean not null default true,

  referral_enabled  boolean not null default true,
  referral_invite_limit int not null default 0, -- 0 = unlimited

  default_member_status text not null default 'PENDING' -- PENDING/ACTIVE
);

-- Ensure single row exists
insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- 2) RLS: read settings for everyone authenticated (optional)
-- If you need public read (anon), change to "to anon, authenticated" and ensure safe fields only.
drop policy if exists "app_settings_read_authenticated" on public.app_settings;
create policy "app_settings_read_authenticated"
on public.app_settings
for select
to authenticated
using (true);

-- No direct update policy (updates only via RPC)
-- 3) RPC: get settings (optional convenience; select policy already allows)
create or replace function public.get_app_settings()
returns public.app_settings
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.app_settings
  where id = 1;
$$;

grant execute on function public.get_app_settings() to authenticated;

-- 4) RPC: admin update settings (admin-only) + audit log
create or replace function public.admin_update_app_settings(
  p_updates jsonb,
  p_action text default 'UPDATE_APP_SETTINGS'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role text;

  v_maintenance boolean;
  v_reg_open boolean;
  v_ref_enabled boolean;
  v_ref_limit int;
  v_default_status text;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin(actor) then
    raise exception 'Forbidden: admin only';
  end if;

  select lower(coalesce(role,'member')) into actor_role
  from public.profiles where id = actor;

  -- Extract allowed fields only
  if (p_updates ? 'maintenance_mode') then
    v_maintenance := (p_updates->>'maintenance_mode')::boolean;
  end if;

  if (p_updates ? 'registrations_open') then
    v_reg_open := (p_updates->>'registrations_open')::boolean;
  end if;

  if (p_updates ? 'referral_enabled') then
    v_ref_enabled := (p_updates->>'referral_enabled')::boolean;
  end if;

  if (p_updates ? 'referral_invite_limit') then
    v_ref_limit := (p_updates->>'referral_invite_limit')::int;
    if v_ref_limit < 0 then
      raise exception 'referral_invite_limit must be >= 0';
    end if;
  end if;

  if (p_updates ? 'default_member_status') then
    v_default_status := upper(coalesce(p_updates->>'default_member_status',''));
    if v_default_status not in ('PENDING','ACTIVE') then
      raise exception 'default_member_status must be PENDING or ACTIVE';
    end if;
  end if;

  update public.app_settings
  set
    maintenance_mode       = coalesce(v_maintenance, maintenance_mode),
    registrations_open     = coalesce(v_reg_open, registrations_open),
    referral_enabled       = coalesce(v_ref_enabled, referral_enabled),
    referral_invite_limit  = coalesce(v_ref_limit, referral_invite_limit),
    default_member_status  = coalesce(v_default_status, default_member_status),
    updated_at             = now(),
    updated_by             = actor
  where id = 1;

  insert into public.admin_audit_log(actor_id, action, target_id, payload)
  values (
    actor,
    coalesce(p_action, 'UPDATE_APP_SETTINGS'),
    null,
    jsonb_build_object(
      'updates', p_updates,
      'actor_role', actor_role
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_update_app_settings(jsonb, text) to authenticated;

commit;
