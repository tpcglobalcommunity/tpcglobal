-- Fix SECURITY DEFINER untuk view web3_user_stats
-- Drop view lama dan recreate dengan SECURITY INVOKER

DROP VIEW IF EXISTS public.web3_user_stats;

-- Create view baru dengan SECURITY INVOKER (lebih aman)
CREATE VIEW public.web3_user_stats AS
SELECT 
    p.id,
    p.username,
    p.email,
    p.wallet_address,
    p.tpc_balance,
    p.created_at,
    p.updated_at,
    -- Tambahkan kolom lain yang diperlukan
    COALESCE(p.verified, false) as verified,
    COALESCE(p.can_invite, false) as can_invite,
    p.status,
    p.role
FROM public.profiles p
WHERE p.status = 'ACTIVE';

-- Enable RLS untuk view (opsional, untuk extra security)
ALTER VIEW public.web3_user_stats SET (security_invoker = true);

-- Atau jika ingin RLS:
-- ALTER VIEW public.web3_user_stats SET (security_barrier = true);
