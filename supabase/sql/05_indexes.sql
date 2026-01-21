-- =====================================================
-- PERFORMANCE INDEXES FOR ADMIN SYSTEM
-- =====================================================

-- Profiles table indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_verified on public.profiles(verified);
create index if not exists idx_profiles_created_at on public.profiles(created_at);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_username on public.profiles(username);

-- Verification requests indexes
create index if not exists idx_verification_requests_status on public.verification_requests(status);
create index if not exists idx_verification_requests_user_id on public.verification_requests(user_id);
create index if not exists idx_verification_requests_created_at on public.verification_requests(created_at);

-- Referral system indexes
create index if not exists idx_referral_codes_created_by on public.referral_codes(created_by);
create index if not exists idx_referral_codes_code on public.referral_codes(code);
create index if not exists idx_referral_uses_used_by on public.referral_uses(used_by);
create index if not exists idx_referral_uses_created_by on public.referral_uses(created_by);

-- Admin audit log indexes
create index if not exists idx_admin_audit_log_actor_id on public.admin_audit_log(actor_id);
create index if not exists idx_admin_audit_log_target_id on public.admin_audit_log(target_id);
create index if not exists idx_admin_audit_log_action on public.admin_audit_log(action);
create index if not exists idx_admin_audit_log_created_at on public.admin_audit_log(created_at);

-- App settings indexes
create index if not exists idx_app_settings_key on public.app_settings(key);
create index if not exists idx_app_settings_updated_at on public.app_settings(updated_at);
