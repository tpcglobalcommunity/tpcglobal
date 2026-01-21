-- =====================================================
-- FINAL RLS POLICIES (AD-1 SECURITY LEVEL)
-- =====================================================

-- Helper function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 
    from public.profiles 
    where id = user_id 
    and role = 'admin'
  );
$$;

-- Helper function to check if user is moderator or admin
create or replace function public.is_moderator_or_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 
    from public.profiles 
    where id = user_id 
    and role in ('moderator', 'admin')
  );
$$;

-- =====================================================
-- PROFILES TABLE RLS POLICIES
-- =====================================================

-- Users can read their own profile
create policy "profiles_read_own" on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Moderators and admins can read all profiles
create policy "profiles_read_moderator" on public.profiles
  for select
  to authenticated
  using (public.is_moderator_or_admin(auth.uid()));

-- Users can update their own profile (limited fields)
create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

-- Only admins can update any profile
create policy "profiles_update_admin" on public.profiles
  for update
  to authenticated
  using (public.is_admin(auth.uid()));

-- Users can insert their own profile
create policy "profiles_insert_own" on public.profiles
  for insert
  to authenticated
  using (id = auth.uid());

-- Only admins can delete profiles
create policy "profiles_delete_admin" on public.profiles
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- =====================================================
-- VERIFICATION REQUESTS TABLE RLS POLICIES
-- =====================================================

-- Users can read their own verification requests
create policy "verification_requests_read_own" on public.verification_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- Moderators and admins can read all verification requests
create policy "verification_requests_read_moderator" on public.verification_requests
  for select
  to authenticated
  using (public.is_moderator_or_admin(auth.uid()));

-- Users can insert verification requests (own profile)
create policy "verification_requests_insert_own" on public.verification_requests
  for insert
  to authenticated
  using (user_id = auth.uid());

-- Only admins can update verification requests
create policy "verification_requests_update_admin" on public.verification_requests
  for update
  to authenticated
  using (public.is_admin(auth.uid()));

-- Only admins can delete verification requests
create policy "verification_requests_delete_admin" on public.verification_requests
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- =====================================================
-- REFERRAL SYSTEM RLS POLICIES
-- =====================================================

-- Users can read their own referral codes
create policy "referral_codes_read_own" on public.referral_codes
  for select
  to authenticated
  using (created_by = auth.uid());

-- Users can read referral uses where they are referrer or referred
create policy "referral_uses_read_related" on public.referral_uses
  for select
  to authenticated
  using (created_by = auth.uid() or used_by = auth.uid());

-- Users can insert referral codes (own)
create policy "referral_codes_insert_own" on public.referral_codes
  for insert
  to authenticated
  using (created_by = auth.uid());

-- Only admins can update/delete referral codes
create policy "referral_codes_admin" on public.referral_codes
  for all
  to authenticated
  using (public.is_admin(auth.uid()));

-- Users can insert referral uses (own)
create policy "referral_uses_insert_own" on public.referral_uses
  for insert
  to authenticated
  using (used_by = auth.uid());

-- Only admins can update/delete referral uses
create policy "referral_uses_admin" on public.referral_uses
  for all
  to authenticated
  using (public.is_admin(auth.uid()));

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

alter table public.profiles enable row level security;
alter table public.verification_requests enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_uses enable row level security;
