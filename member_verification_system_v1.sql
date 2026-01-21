-- ==========================================
-- S) MEMBER VERIFY SYSTEM v1 (SAFE)
-- - store wallet address in profile (self)
-- - create verification request record
-- ==========================================

-- 1) Add columns if not exist (safe)
alter table public.profiles
  add column if not exists wallet_address text,
  add column if not exists verification_status text default 'NONE'; -- NONE / REQUESTED / VERIFIED / REJECTED

-- 2) Table to store verification requests
create table if not exists public.verification_requests (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null,
  wallet_address text not null,
  status text not null default 'REQUESTED', -- REQUESTED/APPROVED/REJECTED
  notes text
);

alter table public.verification_requests enable row level security;

-- Allow users to read their own requests
drop policy if exists "verification_requests_read_own" on public.verification_requests;
create policy "verification_requests_read_own"
on public.verification_requests
for select
to authenticated
using (user_id = auth.uid());

-- No direct insert/update policies (force RPC)

-- 3) RPC: member set wallet self (sanitized)
create or replace function public.member_set_wallet_self(p_wallet text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v_wallet text := nullif(trim(coalesce(p_wallet,'')), '');
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  if v_wallet is null then
    return jsonb_build_object('ok', false, 'error', 'EMPTY_WALLET');
  end if;

  -- Basic Solana address format check (base58, length typically 32-44)
  if length(v_wallet) < 32 or length(v_wallet) > 44 then
    return jsonb_build_object('ok', false, 'error', 'WALLET_LENGTH');
  end if;

  if v_wallet !~ '^[1-9A-HJ-NP-Za-km-z]+$' then
    return jsonb_build_object('ok', false, 'error', 'WALLET_FORMAT');
  end if;

  update public.profiles
  set wallet_address = v_wallet,
      updated_at = now()
  where id = actor;

  return jsonb_build_object('ok', true, 'wallet_address', v_wallet);
end;
$$;

grant execute on function public.member_set_wallet_self(text) to authenticated;

-- 4) RPC: request verification
create or replace function public.request_verification(p_wallet text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v_wallet text := nullif(trim(coalesce(p_wallet,'')), '');
  v_status text;
  v_exists boolean;
begin
  if actor is null then
    raise exception 'Not authenticated';
  end if;

  -- ensure wallet already saved/valid
  if v_wallet is null then
    return jsonb_build_object('ok', false, 'error', 'EMPTY_WALLET');
  end if;

  -- prevent spamming: if already requested and not resolved
  select upper(coalesce(verification_status,'NONE')) into v_status
  from public.profiles where id = actor;

  if v_status in ('REQUESTED','VERIFIED') then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_' || v_status);
  end if;

  -- ensure wallet in profile matches (optional)
  update public.profiles
  set wallet_address = v_wallet,
      verification_status = 'REQUESTED',
      updated_at = now()
  where id = actor;

  -- prevent duplicate open requests
  select exists(
    select 1 from public.verification_requests
    where user_id = actor and status = 'REQUESTED'
  ) into v_exists;

  if not v_exists then
    insert into public.verification_requests(user_id, wallet_address, status)
    values (actor, v_wallet, 'REQUESTED');
  end if;

  -- Optional: audit log if table exists
  -- If admin_audit_log exists, record request (safe, doesn't expose secrets)
  begin
    insert into public.admin_audit_log(actor_id, action, target_id, payload)
    values (actor, 'REQUEST_VERIFICATION', actor, jsonb_build_object('wallet', v_wallet));
  exception when others then
    -- ignore if audit table not present
    null;
  end;

  return jsonb_build_object('ok', true, 'status', 'REQUESTED');
end;
$$;

grant execute on function public.request_verification(text) to authenticated;
