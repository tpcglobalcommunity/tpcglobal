-- =========================================================
-- UPDATE PUBLIC WALLETS (TRANSPARENCY V2)
-- Isi address sesuai wallet resmi (Solana)
-- =========================================================
update public.app_settings
set
  value = jsonb_build_object(
    'treasury',  jsonb_build_object('label','Treasury Wallet','address','PASTE_TREASURY_ADDRESS'),
    'buyback',   jsonb_build_object('label','Buyback Wallet','address','PASTE_BUYBACK_ADDRESS'),
    'burn',      jsonb_build_object('label','Burn Wallet','address','PASTE_BURN_ADDRESS'),
    'liquidity', jsonb_build_object('label','Liquidity Wallet','address','PASTE_LIQUIDITY_ADDRESS')
  ),
  updated_at = now()
where key = 'public_wallets';

-- kalau row belum ada, insert
insert into public.app_settings(key, value)
select
  'public_wallets',
  jsonb_build_object(
    'treasury',  jsonb_build_object('label','Treasury Wallet','address','PASTE_TREASURY_ADDRESS'),
    'buyback',   jsonb_build_object('label','Buyback Wallet','address','PASTE_BUYBACK_ADDRESS'),
    'burn',      jsonb_build_object('label','Burn Wallet','address','PASTE_BURN_ADDRESS'),
    'liquidity', jsonb_build_object('label','Liquidity Wallet','address','PASTE_LIQUIDITY_ADDRESS')
  )
where not exists (select 1 from public.app_settings where key='public_wallets');
