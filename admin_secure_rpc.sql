-- ================================
-- D) ADMIN SECURE RPC + RLS + AUDIT LOG (TPC)
-- ================================
-- What this does:
-- 1) Adds admin audit log table
-- 2) Adds helper function is_admin()
-- 3) Adds trigger protection so non-admin cannot change protected fields on profiles
-- 4) Adds SECURITY DEFINER RPC: admin_update_profile()
-- 5) Adds RLS policies for audit log
--
-- Notes:
-- - This assumes public.profiles exists with id = auth.uid()
-- - Works best if profiles is NOT FORCE ROW LEVEL SECURITY (default in Supabase)
-- - Frontend will call RPC instead of direct update for admin actions

begin;

-- 0) Extensions (optional; usually already)
-- create extension if not exists pgcrypto;

-- 1) ADMIN AUDIT LOG TABLE
create table if not exists public.admin_audit_log (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  actor_id     uuid not null,
  action       text not null,
  target_id    uuid,
  payload      jsonb not null default '{}'::jsonb
);

alter table public.admin_audit_log enable row level security;

-- 2) Helper function: is_admin(uid)
create or replace function public.is_admin(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_uid
      and lower(coalesce(p.role, 'member')) in ('admin','super_admin')
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- 3) RLS: Audit log readable only by admin/super_admin
drop policy if exists "audit_select_admin_only" on public.admin_audit_log;
create policy "audit_select_admin_only"
on public.admin_audit_log
for select
to authenticated
using (public.is_admin(auth.uid()));

-- Inserts only via RPC owner (security definer) — no direct insert policy needed
-- (If you want to allow admin direct insert, you can add a policy, but recommended no.)

-- 4) PROTECT ADMIN FIELDS ON PROFILES (Trigger)
-- This prevents non-admin users from changing protected columns even if they have an "update own profile" policy.
create or replace function public.profiles_protect_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_is_admin boolean := public.is_admin(actor);
begin
  -- If actor is null (no auth), block
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  -- If not admin, block changes to protected fields
  if not actor_is_admin then
    if coalesce(new.role, '') is distinct from coalesce(old.role, '') then
      raise exception 'Forbidden: role is protected';
    end if;

    if coalesce(new.status, '') is distinct from coalesce(old.status, '') then
      raise exception 'Forbidden: status is protected';
    end if;

    if coalesce(new.verified, false) is distinct from coalesce(old.verified, false) then
      raise exception 'Forbidden: verified is protected';
    end if;

    -- Add more protected columns if you use them:
    if (to_jsonb(new) ? 'can_invite') then
      -- only check if column exists in table; if not, this won't matter
      if (to_jsonb(old) ? 'can_invite') then
        if (to_jsonb(new)->>'can_invite') is distinct from (to_jsonb(old)->>'can_invite') then
          raise exception 'Forbidden: can_invite is protected';
        end if;
      end if;
    end if;

    if (to_jsonb(new) ? 'referral_code') and (to_jsonb(old) ? 'referral_code') then
      if (to_jsonb(new)->>'referral_code') is distinct from (to_jsonb(old)->>'referral_code') then
        raise exception 'Forbidden: referral_code is protected';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_admin_fields on public.profiles;
create trigger trg_profiles_protect_admin_fields
before update on public.profiles
for each row
execute function public.profiles_protect_admin_fields();

-- 5) ADMIN RPC: admin_update_profile(target_id, updates jsonb)
-- Allowed keys: role, status, verified, can_invite, referral_code, full_name, username
create or replace function public.admin_update_profile(
  p_target_id uuid,
  p_updates jsonb,
  p_action text default 'ADMIN_UPDATE_PROFILE'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  actor_role text;
  target_role text;
  allowed boolean;
  v_role text;
  v_status text;
  v_verified boolean;
  v_can_invite boolean;
  v_referral_code text;
  v_full_name text;
  v_username text;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  allowed := public.is_admin(actor);
  if not allowed then
    raise exception 'Forbidden: admin only';
  end if;

  select lower(coalesce(role,'member')) into actor_role
  from public.profiles where id = actor;

  select lower(coalesce(role,'member')) into target_role
  from public.profiles where id = p_target_id;

  if target_role is null then
    raise exception 'Target profile not found';
  end if;

  -- Rule: Only super_admin can modify super_admin
  if target_role = 'super_admin' and actor_role <> 'super_admin' then
    raise exception 'Forbidden: only super_admin can modify super_admin';
  end if;

  -- Rule: Prevent admin from promoting to super_admin (only super_admin can)
  if (p_updates ? 'role') then
    v_role := lower(coalesce(p_updates->>'role',''));
    if v_role = 'super_admin' and actor_role <> 'super_admin' then
      raise exception 'Forbidden: only super_admin can assign super_admin';
    end if;
  end if;

  -- Extract fields safely (only if present)
  if (p_updates ? 'status') then v_status := upper(p_updates->>'status'); end if;
  if (p_updates ? 'verified') then v_verified := (p_updates->>'verified')::boolean; end if;

  if (p_updates ? 'can_invite') then
    v_can_invite := (p_updates->>'can_invite')::boolean;
  end if;

  if (p_updates ? 'referral_code') then v_referral_code := p_updates->>'referral_code'; end if;
  if (p_updates ? 'full_name') then v_full_name := p_updates->>'full_name'; end if;
  if (p_updates ? 'username') then v_username := p_updates->>'username'; end if;

  -- Apply update (only set values that are provided)
  update public.profiles
  set
    role         = coalesce(v_role, role),
    status       = coalesce(v_status, status),
    verified     = coalesce(v_verified, verified),
    can_invite   = coalesce(v_can_invite, can_invite),
    referral_code= coalesce(v_referral_code, referral_code),
    full_name    = coalesce(v_full_name, full_name),
    username     = coalesce(v_username, username),
    updated_at   = now()
  where id = p_target_id;

  -- Audit log
  insert into public.admin_audit_log(actor_id, action, target_id, payload)
  values (
    actor,
    coalesce(p_action, 'ADMIN_UPDATE_PROFILE'),
    p_target_id,
    jsonb_build_object(
      'updates', p_updates,
      'actor_role', actor_role,
      'target_role', target_role
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_update_profile(uuid, jsonb, text) to authenticated;

commit;
