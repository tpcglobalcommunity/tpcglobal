/*
  # Create Trust Snapshot System - Server-Enforced Badge System

  1. New RPC Functions
    - `get_trust_snapshot(identifier)` - Get safe trust data for any user
      Returns verified status, role, invite status, vendor status, and public profile info
      Safe for public/anon access - NO sensitive data exposed

  2. Trust Badges Included
    - Verified Member (is_verified)
    - Staff Role (role: member, moderator, admin, super_admin)
    - Invite Status (can_invite)
    - Vendor Status (approved, pending, rejected, none)

  3. Security
    - SECURITY DEFINER for safe vendor status lookup
    - NO user_id, NO email, NO referral_code, NO referred_by
    - Public-safe: granted to anon + authenticated
    - Vendor pending/rejected hidden from public display (client handles)

  4. Important Notes
    - Single source of truth for all trust badges
    - Server-enforced - no client-side spoofing possible
    - Used across: profiles, directory, marketplace, verify page
    - Vendor status derived from vendor_applications table
    - Lookup by username OR referral_code (case-insensitive)
*/

-- Create RPC to get trust snapshot for any user (public-safe)
CREATE OR REPLACE FUNCTION get_trust_snapshot(identifier text)
RETURNS TABLE (
  username text,
  full_name text,
  avatar_url text,
  role text,
  is_verified boolean,
  can_invite boolean,
  created_at timestamptz,
  show_in_directory boolean,
  vendor_status text,
  vendor_brand_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_profile RECORD;
  v_vendor_status text;
  v_vendor_brand text;
BEGIN
  -- Find user by referral_code or username (case-insensitive)
  SELECT id INTO v_user_id
  FROM profiles
  WHERE 
    LOWER(referral_code) = LOWER(TRIM(identifier))
    OR LOWER(username) = LOWER(TRIM(identifier))
  LIMIT 1;

  -- Return empty if not found
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get profile data
  SELECT 
    p.username,
    p.full_name,
    p.avatar_url,
    p.role,
    p.is_verified,
    p.can_invite,
    p.created_at,
    p.show_in_directory
  INTO v_profile
  FROM profiles p
  WHERE p.id = v_user_id;

  -- Determine vendor status from vendor_applications
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = v_user_id AND status = 'approved'
      ) THEN 'approved'
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = v_user_id AND status = 'pending'
      ) THEN 'pending'
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = v_user_id AND status = 'rejected'
      ) THEN 'rejected'
      ELSE 'none'
    END
  INTO v_vendor_status;

  -- Get vendor brand name if approved
  IF v_vendor_status = 'approved' THEN
    SELECT brand_name INTO v_vendor_brand
    FROM vendor_applications
    WHERE user_id = v_user_id AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    v_vendor_brand := NULL;
  END IF;

  -- Return safe data
  RETURN QUERY SELECT
    v_profile.username,
    v_profile.full_name,
    v_profile.avatar_url,
    v_profile.role,
    v_profile.is_verified,
    v_profile.can_invite,
    v_profile.created_at,
    v_profile.show_in_directory,
    v_vendor_status,
    v_vendor_brand;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_trust_snapshot(text) TO anon, authenticated;

-- Create index on vendor_applications for faster lookups
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_status ON vendor_applications(user_id, status);

-- Update existing profile RPC to include vendor status (optional enhancement)
-- This ensures consistency when loading own profile
CREATE OR REPLACE FUNCTION get_profile_with_referrals(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  role text,
  is_verified boolean,
  can_invite boolean,
  referral_code text,
  referred_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  total_referrals bigint,
  verified_referrals bigint,
  vendor_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor_status text;
BEGIN
  -- Check if user has vendor application
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = p_user_id AND status = 'approved'
      ) THEN 'approved'
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = p_user_id AND status = 'pending'
      ) THEN 'pending'
      WHEN EXISTS (
        SELECT 1 FROM vendor_applications 
        WHERE user_id = p_user_id AND status = 'rejected'
      ) THEN 'rejected'
      ELSE 'none'
    END
  INTO v_vendor_status;

  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.role,
    p.is_verified,
    p.can_invite,
    p.referral_code,
    p.referred_by,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT r.id)::bigint AS total_referrals,
    COUNT(DISTINCT r.id) FILTER (WHERE r.is_verified = true)::bigint AS verified_referrals,
    v_vendor_status
  FROM profiles p
  LEFT JOIN profiles r ON r.referred_by = p.id
  WHERE p.id = p_user_id
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.role, 
           p.is_verified, p.can_invite, p.referral_code, p.referred_by, 
           p.created_at, p.updated_at;
END;
$$;