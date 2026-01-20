-- Permissions + Reload Schema Cache
-- Run this after creating or updating RPC functions

-- Revoke all permissions from public
revoke all on function public.get_my_referral_analytics() from public;

-- Grant execute to authenticated users only
grant execute on function public.get_my_referral_analytics() to authenticated;

-- Optional: Grant to anon if needed (uncomment if required)
-- grant execute on function public.get_my_referral_analytics() to anon;

-- Reload PostgREST schema cache to recognize new function
select pg_notify('pgrst', 'reload schema');

-- Verification
select 'Permissions set and schema cache reloaded' as status;

-- Check current permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_routine_grants 
WHERE routine_name = 'get_my_referral_analytics'
  AND routine_schema = 'public';

-- Check function exists
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS arguments,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'get_my_referral_analytics';
