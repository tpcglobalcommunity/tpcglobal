// =========================================================
// PROFILE TYPES FOR FRONTEND
// TypeScript interfaces untuk ensure_profile system
// =========================================================

import { supabase } from '../lib/supabase';

export interface ProfileData {
  id: string;
  email: string;
  username: string | null;
  member_code: string;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  role: 'MEMBER' | 'admin' | 'super_admin';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'NO_PROFILE' | 'ERROR';
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
  profile_created: boolean;
  message: string;
}

export interface ProfileResponse {
  data: ProfileData[] | null;
  error: any;
}

export interface NavigationData {
  route: string;
  reason: string;
  profile_status: string;
  user_role: string;
}

export interface ProfileWithNavigation extends ProfileData {
  navigation_route: string;
  navigation_reason: string;
  can_access_admin: boolean;
  can_access_member: boolean;
}

// =========================================================
// PROFILE HELPER FUNCTIONS
// =========================================================

/**
 * Ensure profile exists and get complete data
 */
export async function ensureProfile(): Promise<ProfileData> {
  const { data, error } = await supabase.rpc("ensure_profile");
  
  if (error) {
    console.error("ensure_profile failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error("No profile data returned");
  }
  
  return data[0];
}

/**
 * Get navigation route based on profile
 */
export async function getNavigationRoute(): Promise<NavigationData> {
  const { data, error } = await supabase.rpc("get_navigation_route");
  
  if (error) {
    console.error("get_navigation_route failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error("No navigation data returned");
  }
  
  return data[0];
}

/**
 * Get profile with navigation info
 */
export async function getProfileWithNavigation(): Promise<ProfileWithNavigation> {
  const { data, error } = await supabase.rpc("get_profile_with_navigation");
  
  if (error) {
    console.error("get_profile_with_navigation failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error("No profile data returned");
  }
  
  return data[0];
}

/**
 * Update login activity
 */
export async function updateLoginActivity(): Promise<{
  ok: boolean;
  message: string;
  login_count: number;
  last_login: string;
}> {
  const { data, error } = await supabase.rpc("update_login_activity");
  
  if (error) {
    console.error("update_login_activity failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error("No activity data returned");
  }
  
  return data[0];
}

/**
 * Activate profile with username and referral
 */
export async function activateProfile(
  username: string,
  referralCode?: string
): Promise<{
  ok: boolean;
  message: string;
  navigation_route: string;
  profile_status: string;
}> {
  const { data, error } = await supabase.rpc("activate_profile", {
    p_username: username,
    p_referral_code: referralCode || null
  });
  
  if (error) {
    console.error("activate_profile failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error("No activation data returned");
  }
  
  return data[0];
}

/**
 * Validate referral code
 */
export async function validateReferralCode(code: string): Promise<{
  is_valid: boolean;
  referrer_id: string | null;
  referrer_username: string | null;
  referrer_member_code: string | null;
}> {
  const { data, error } = await supabase.rpc("validate_referral_code_public", {
    p_referral_code: code.trim().toUpperCase()
  });
  
  if (error) {
    console.error("validate_referral_code failed", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return {
      is_valid: false,
      referrer_id: null,
      referrer_username: null,
      referrer_member_code: null
    };
  }
  
  return data[0];
}

// =========================================================
// NAVIGATION HELPERS
// =========================================================

/**
 * Navigate based on profile
 */
export function navigateByProfile(profile: ProfileData | ProfileWithNavigation): string {
  if ('navigation_route' in profile) {
    return profile.navigation_route;
  }
  
  // Fallback logic
  if (profile.role === 'super_admin') {
    return '/admin';
  } else if (profile.status !== 'ACTIVE') {
    return '/member/onboarding';
  } else {
    return '/member/dashboard';
  }
}

/**
 * Check if user can access admin area
 */
export function canAccessAdmin(profile: ProfileData | ProfileWithNavigation): boolean {
  if ('can_access_admin' in profile) {
    return profile.can_access_admin;
  }
  
  return profile.role === 'super_admin' || profile.role === 'admin';
}

/**
 * Check if user can access member area
 */
export function canAccessMember(profile: ProfileData | ProfileWithNavigation): boolean {
  if ('can_access_member' in profile) {
    return profile.can_access_member;
  }
  
  return profile.status === 'ACTIVE' && profile.is_profile_complete;
}

/**
 * Get profile display name
 */
export function getProfileDisplayName(profile: ProfileData | ProfileWithNavigation): string {
  return profile.username || profile.email.split('@')[0] || 'Unknown User';
}

/**
 * Get profile status color for UI
 */
export function getProfileStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'text-green-500';
    case 'PENDING':
      return 'text-yellow-500';
    case 'SUSPENDED':
      return 'text-red-500';
    case 'NO_PROFILE':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Format member code for display
 */
export function formatMemberCode(memberCode: string): string {
  return memberCode || 'No Code';
}

/**
 * Check if profile needs onboarding
 */
export function needsOnboarding(profile: ProfileData | ProfileWithNavigation): boolean {
  return !profile.is_profile_complete || profile.status !== 'ACTIVE';
}
