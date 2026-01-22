-- =====================================================
-- AG3+4 — Force Refresh Tier (Admin RPC, tanpa nunggu cron)
-- =====================================================

create or replace function public.admin_force_verify_wallet(p_user_id uuid)
returns table(user_id uuid, wallet_address text)
language plpgsql
security definer
set search_path = public
as $$
declare
  w text;
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select wallet_address into w
  from public.user_wallets
  where user_id = p_user_id and chain='solana' and is_primary=true
  order by created_at desc
  limit 1;

  if w is null then
    raise exception 'user has no primary wallet';
  end if;

  -- Return wallet so frontend can call to Edge Function with this info if needed
  return query select p_user_id, w;

  perform public.log_admin_action(
    'ADMIN_FORCE_VERIFY_WALLET',
    auth.uid(),
    jsonb_build_object('target_user', p_user_id, 'wallet', w)
  );
end;
$$;

grant execute on function public.admin_force_verify_wallet(uuid) to authenticated;
