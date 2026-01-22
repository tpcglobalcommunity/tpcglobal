-- =====================================================
-- AG3) user sets primary wallet
-- =====================================================

create or replace function public.set_primary_wallet(p_wallet_address text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  -- set all wallets non-primary
  update public.user_wallets
  set is_primary = false
  where user_id = auth.uid() and chain = 'solana';

  -- upsert wallet as primary
  insert into public.user_wallets(user_id, chain, wallet_address, is_primary)
  values (auth.uid(), 'solana', p_wallet_address, true)
  on conflict (user_id, chain, wallet_address)
  do update set is_primary = true;

  -- notify user
  perform public.push_notification(
    auth.uid(),
    'WALLET_LINKED',
    'Wallet linked',
    'Your Solana wallet has been linked. Verification will update your tier shortly.',
    jsonb_build_object('wallet', p_wallet_address)
  );
end;
$$;

grant execute on function public.set_primary_wallet(text) to authenticated;
