-- =====================================================
-- AG3+3 — Admin Page: Monitor Wallet & Tier Semua Member
-- =====================================================

-- A) SQL VIEW aman (admin-only via RLS policy)
create or replace view public.admin_wallet_tiers as
select
  p.id as user_id,
  p.email,
  p.username,
  p.full_name,
  p.role,
  p.status,
  p.verified,
  p.tpc_tier,
  p.tpc_balance,
  p.wallet_verified_at,
  uw.wallet_address
from public.profiles p
left join lateral (
  select wallet_address
  from public.user_wallets
  where user_id = p.id and chain='solana' and is_primary=true
  order by created_at desc
  limit 1
) uw on true;

alter view public.admin_wallet_tiers set (security_invoker = true);

-- RLS on underlying tables already exist; access to profiles should be admin-limited by your admin policies.
-- If your profiles RLS already blocks non-admin reads, this view is safe.

-- Catatan: view ini "ngikutin" RLS profiles. Jadi kalau profiles sudah admin-only untuk read semua, maka view juga aman.
