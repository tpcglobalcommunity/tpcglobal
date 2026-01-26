-- Add onchain_tx column to batches table
alter table public.tpc_distribution_batches
  add column if not exists onchain_tx text;

-- Admin-only RPC to attach on-chain tx signature
create or replace function public.admin_set_batch_onchain_tx(
  p_batch_id uuid,
  p_onchain_tx text
)
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

  if p_onchain_tx is null or length(trim(p_onchain_tx)) < 20 then
    raise exception 'invalid tx signature';
  end if;

  update public.tpc_distribution_batches
  set onchain_tx = trim(p_onchain_tx)
  where id = p_batch_id;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_set_batch_onchain_tx(uuid, text) to authenticated;
