-- =====================================================
-- ADMIN TRANSPARENCY FUNCTIONS
-- Add transparency updates with super admin authorization
-- =====================================================

create or replace function public.admin_add_transparency_update(
  p_title text,
  p_body text,
  p_category text default 'general',
  p_tx_hash text default null,
  p_amount numeric default null,
  p_token_symbol text default null,
  p_chain text default 'solana'
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  insert into public.public_transparency_updates(title, body, category, tx_hash, amount, token_symbol, chain)
  values (p_title, p_body, p_category, p_tx_hash, p_amount, p_token_symbol, p_chain);

  perform public.log_admin_action(
    'ADMIN_ADD_TRANSPARENCY_UPDATE',
    auth.uid(),
    jsonb_build_object('title', p_title, 'category', p_category, 'tx_hash', p_tx_hash)
  );
end;
$$;

grant execute on function public.admin_add_transparency_update(text, text, text, text, numeric, text, text) to authenticated;
