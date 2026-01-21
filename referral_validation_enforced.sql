-- ==========================================
-- L) ENFORCE app_settings ON REFERRAL VALIDATION (PUBLIC SAFE)
-- ==========================================
-- Enforces:
-- - registrations_open must be true
-- - referral_enabled must be true
-- - invite limit (if > 0) must not be exceeded
--
-- Assumes tables:
-- public.app_settings (id=1)
-- public.referral_codes (code text pk, is_active bool, used_count int, owner_id uuid, created_at)
--
-- This function is intended to be callable by anon (signup page), so SECURITY DEFINER is required.

create or replace function public.validate_referral_code_public(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code,'')));
  v_is_active boolean;
  v_used_count int;
  v_owner_id uuid;

  v_reg_open boolean;
  v_ref_enabled boolean;
  v_limit int;
begin
  -- Basic input validation
  if v_code = '' then
    return jsonb_build_object('ok', false, 'error', 'EMPTY_CODE');
  end if;

  -- Load global settings (single row)
  select registrations_open, referral_enabled, referral_invite_limit
    into v_reg_open, v_ref_enabled, v_limit
    from public.app_settings
    where id = 1;

  -- If settings row missing, fail safe
  if v_reg_open is null then
    return jsonb_build_object('ok', false, 'error', 'SETTINGS_NOT_CONFIGURED');
  end if;

  -- Enforce: registrations gate
  if v_reg_open = false then
    return jsonb_build_object('ok', false, 'error', 'REGISTRATIONS_CLOSED');
  end if;

  -- Enforce: referral enabled
  if v_ref_enabled = false then
    return jsonb_build_object('ok', false, 'error', 'REFERRAL_DISABLED');
  end if;

  -- Validate code exists & active
  select is_active, coalesce(used_count,0), owner_id
    into v_is_active, v_used_count, v_owner_id
    from public.referral_codes
    where upper(code) = v_code
    limit 1;

  if v_is_active is null then
    return jsonb_build_object('ok', false, 'error', 'INVALID_CODE');
  end if;

  if v_is_active = false then
    return jsonb_build_object('ok', false, 'error', 'CODE_DISABLED');
  end if;

  -- Enforce invite limit if configured (>0)
  if coalesce(v_limit,0) > 0 and v_used_count >= v_limit then
    return jsonb_build_object(
      'ok', false,
      'error', 'INVITE_LIMIT_REACHED',
      'limit', v_limit,
      'used', v_used_count
    );
  end if;

  -- OK
  return jsonb_build_object(
    'ok', true,
    'code', v_code,
    'owner_id', v_owner_id,
    'used_count', v_used_count,
    'limit', coalesce(v_limit,0)
  );
end;
$$;

-- Permissions: anon + authenticated can call (public signup)
grant execute on function public.validate_referral_code_public(text) to anon, authenticated;
