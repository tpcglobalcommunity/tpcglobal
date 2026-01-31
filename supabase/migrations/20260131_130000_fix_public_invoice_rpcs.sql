/*
  FIX: Public Invoice RPCs + Anon-safe Payment Confirmation
  - Canonical function signatures (NO overload ambiguity)
  - Supports anon users (auth.uid() can be null)
  - Status constraint includes PENDING_REVIEW
  - invoice_confirmations.user_id nullable
*/

begin;

-- =========================================================
-- 0) STATUS CONSTRAINT MUST SUPPORT PENDING_REVIEW
-- =========================================================
do $$
begin
  -- Ensure column exists (safe if already exists)
  if not exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='tpc_invoices' and column_name='status'
  ) then
    alter table public.tpc_invoices
      add column status text default 'UNPAID';
  end if;

  -- Drop old constraint if exists, then add canonical constraint
  if exists (
    select 1
    from pg_constraint
    where conname = 'tpc_invoices_status_check'
      and conrelid = 'public.tpc_invoices'::regclass
  ) then
    alter table public.tpc_invoices
      drop constraint tpc_invoices_status_check;
  end if;

  alter table public.tpc_invoices
    add constraint tpc_invoices_status_check
    check (status in ('UNPAID','PENDING_REVIEW','PAID','REJECTED','EXPIRED','CANCELLED'));
end $$;

-- =========================================================
-- 1) invoice_confirmations.user_id MUST BE NULLABLE (ANON)
-- =========================================================
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='invoice_confirmations' and column_name='user_id'
  ) then
    alter table public.invoice_confirmations
      alter column user_id drop not null;
  end if;
end $$;

-- =========================================================
-- 2) DROP ALL OVERLOADS (FUNCTIONS) TO AVOID 404 / AMBIGUITY
-- =========================================================
drop function if exists public.get_invoice_public(text);
drop function if exists public.get_invoice_public(p_invoice_no text);

drop function if exists public.submit_invoice_confirmation(
  text, text, text, text, text, text
);

-- if older overloads existed with more/less params, drop broadly:
drop function if exists public.submit_invoice_confirmation(text, text, text, text, text);
drop function if exists public.submit_invoice_confirmation(text, text, text, text);
drop function if exists public.submit_invoice_confirmation(text, text, text);

-- =========================================================
-- 3) CANONICAL: get_invoice_public(p_invoice_no text)
-- =========================================================
create or replace function public.get_invoice_public(p_invoice_no text)
returns table (
  invoice_no text,
  stage text,
  tpc_amount numeric,
  unit_price_usd numeric,
  total_usd numeric,
  total_idr numeric,
  usd_idr_rate numeric,
  treasury_address text,
  status text,
  payment_method text,
  payer_name text,
  payer_ref text,
  tx_signature text,
  proof_url text,
  receiver_wallet text,
  created_at timestamptz,
  expires_at timestamptz,
  reviewed_at timestamptz,
  review_note text
)
language sql
security definer
set search_path = public
as $$
  select
    i.invoice_no,
    i.stage,
    i.tpc_amount,
    i.unit_price_usd,
    i.total_usd,
    i.total_idr,
    i.usd_idr_rate,
    i.treasury_address,
    i.status,
    i.payment_method,
    i.payer_name,
    i.payer_ref,
    i.tx_signature,
    i.proof_url,
    i.receiver_wallet,
    i.created_at,
    i.expires_at,
    i.reviewed_at,
    i.review_note
  from public.tpc_invoices i
  where i.invoice_no = p_invoice_no
  limit 1;
$$;

revoke all on function public.get_invoice_public(text) from public;
grant execute on function public.get_invoice_public(text) to anon, authenticated;

-- =========================================================
-- 4) CANONICAL: submit_invoice_confirmation(6 params exact) + ANTI-TYPO
-- =========================================================
-- 1) DROP dulu function existing (sesuai hint)
drop function if exists public.submit_invoice_confirmation(
  text, text, text, text, text, text
);

-- (opsional tapi aman) drop overload lain kalau pernah ada
drop function if exists public.submit_invoice_confirmation(text, text, text, text, text);
drop function if exists public.submit_invoice_confirmation(text, text, text, text);
drop function if exists public.submit_invoice_confirmation(text, text, text);

-- 2) CREATE ulang dengan signature & return TABLE yang canonical + anti-typo (NO RAISE)
create function public.submit_invoice_confirmation(
  p_invoice_no text,
  p_payment_method text,
  p_payer_name text,
  p_payer_ref text,
  p_tx_signature text,
  p_proof_url text
)
returns table (
  success boolean,
  invoice_no text,
  status text,
  payment_method text,
  confirmation_id bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
  v_conf_id bigint;
  v_method text;
begin
  -- normalize method: trim + upper
  v_method := upper(trim(coalesce(p_payment_method,'')));

  -- tolerate aliases/typos
  if v_method in ('BANK_TRANSFER','BANK TRANSFER','TRANSFER','TRANSFER_BANK','BANK','BANK_TRANSFERS','BANK_TRANSFERS','BANK_TRANSFERs') then
    v_method := 'BANK_TRANSFER';
  elsif v_method in ('USDC','USDC_TRANSFER','USDC-SPL','USDC_SPL') then
    v_method := 'USDC';
  elsif v_method in ('SOL','SOLANA') then
    v_method := 'SOL';
  end if;

  -- validations (NO RAISE)
  if p_invoice_no is null or length(trim(p_invoice_no)) = 0 then
    return query select false, p_invoice_no, null::text, null::text, null::bigint; return;
  end if;

  if v_method is null or v_method = '' then
    return query select false, p_invoice_no, null::text, null::text, null::bigint; return;
  end if;

  if v_method not in ('BANK_TRANSFER','USDC','SOL') then
    return query select false, p_invoice_no, null::text, v_method, null::bigint; return;
  end if;

  if p_proof_url is null or length(trim(p_proof_url)) = 0 then
    return query select false, p_invoice_no, null::text, v_method, null::bigint; return;
  end if;

  select exists(
    select 1 from public.tpc_invoices i where i.invoice_no = p_invoice_no
  ) into v_exists;

  if not v_exists then
    return query select false, p_invoice_no, null::text, v_method, null::bigint; return;
  end if;

  insert into public.invoice_confirmations (
    invoice_no, user_id, payment_method, payer_name, payer_ref, tx_signature, proof_url, created_at
  ) values (
    p_invoice_no, auth.uid(), v_method,
    nullif(trim(p_payer_name), ''),
    nullif(trim(p_payer_ref), ''),
    nullif(trim(p_tx_signature), ''),
    nullif(trim(p_proof_url), ''),
    now()
  )
  returning id into v_conf_id;

  update public.tpc_invoices
  set
    status = 'PENDING_REVIEW',
    payment_method = v_method,
    payer_name = nullif(trim(p_payer_name), ''),
    payer_ref = nullif(trim(p_payer_ref), ''),
    tx_signature = nullif(trim(p_tx_signature), ''),
    proof_url = nullif(trim(p_proof_url), '')
  where invoice_no = p_invoice_no;

  return query select true, p_invoice_no, 'PENDING_REVIEW'::text, v_method, v_conf_id;
end;
$$;

-- 3) GRANTS ulang
revoke all on function public.submit_invoice_confirmation(text, text, text, text, text, text) from public;
grant execute on function public.submit_invoice_confirmation(text, text, text, text, text, text) to anon, authenticated;

commit;
