-- Cek struktur table profiles untuk column yang benar
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Fix SECURITY DEFINER untuk view web3_user_stats dengan column yang benar
DROP VIEW IF EXISTS public.web3_user_stats;

-- Create view baru dengan SECURITY INVOKER dan column yang benar
CREATE VIEW public.web3_user_stats AS
SELECT 
    p.id,
    p.username,
    p.email,
    p.wallet_address,
    p.tpc_balance,
    p.created_at,
    p.updated_at,
    -- Gunakan column yang benar berdasarkan hint
    COALESCE(p.is_verified, false) as verified,
    COALESCE(p.can_invite, false) as can_invite,
    p.status,
    p.role
FROM public.profiles p
WHERE p.status = 'ACTIVE';

-- Set security options
ALTER VIEW public.web3_user_stats SET (security_invoker = true);
