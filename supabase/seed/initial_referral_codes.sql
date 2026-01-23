-- Seed Data: Initial Referral Codes
-- Purpose: Create initial referral codes for testing and bootstrap
-- Author: AI Assistant
-- Date: 2026-01-23
-- Version: 1.0.0

-- Insert bootstrap referral code TPC-BOOT01
INSERT INTO public.profiles (
    id, 
    email, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'bootstrap@tpcglobal.io',
    'TPC-BOOT01',
    'ADMIN',
    'ACTIVE',
    true,
    true,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Insert additional test referral codes (optional)
INSERT INTO public.profiles (
    id, 
    email, 
    referral_code, 
    role, 
    status, 
    verified, 
    can_invite,
    created_at,
    updated_at
) VALUES 
    (gen_random_uuid(), 'test1@tpcglobal.io', 'TPC-TEST01', 'MEMBER', 'ACTIVE', true, true, now(), now()),
    (gen_random_uuid(), 'test2@tpcglobal.io', 'TPC-TEST02', 'MEMBER', 'ACTIVE', true, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add seed data comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles table with referral codes and user metadata';
COMMENT ON COLUMN public.profiles.referral_code IS 'Referral code used for user signup validation';
