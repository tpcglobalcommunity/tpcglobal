-- Get App Settings RPC
-- This function returns application-wide settings

create or replace function public.get_app_settings()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Return default app settings
  return jsonb_build_object(
    'app_name', 'TPC Global',
    'app_version', '1.0.0',
    'maintenance_mode', false,
    'registration_enabled', true,
    'verification_enabled', true,
    'max_upload_size_mb', 10,
    'supported_languages', '["en", "id", "zh"]',
    'default_language', 'en',
    'telegram_community', 'https://t.me/tpcglobalcommunity',
    'created_at', now()
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_app_settings() to authenticated;

-- Grant execute permission to anonymous users (for public access)
grant execute on function public.get_app_settings() to anon;
