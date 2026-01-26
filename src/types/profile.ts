// =========================================================
// PROFILE TYPES FOR FRONTEND
// TypeScript interfaces untuk ensure_profile system
// =========================================================

import { supabase } from '@/lib/supabase';

export interface ProfileData {
  id: string;
  email: string;
  username: string | null;
  member_code: string;
  referral_code: string | null;
  referred_by: string | null;
  role: 'MEMBER' | 'admin' | 'super_admin';
  verified: boolean;
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
  profile_verified: boolean;
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
 * Ensure profile exists and get complete data - SAFE VERSION
 * Never throws errors, always returns fallback data
 */
export async function ensureProfile(): Promise<ProfileData> {
  try {
    const { data, error } = await supabase.rpc("ensure_profile");
    
    if (error) {
      console.error("ensure_profile failed", error);
      // Return safe fallback instead of throwing
      return {
        id: "",
        email: "",
        username: null,
        member_code: "",
        referral_code: null,
        referred_by: null,
        role: "MEMBER",
        verified: false,
        is_profile_complete: false,
        created_at: "",
        updated_at: "",
        profile_created: false,
        message: "Profile ensure failed"
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No profile data returned from ensure_profile");
      // Return safe fallback instead of throwing
      return {
        id: "",
        email: "",
        username: null,
        member_code: "",
        referral_code: null,
        referred_by: null,
        role: "MEMBER",
        verified: false,
        is_profile_complete: false,
        created_at: "",
        updated_at: "",
        profile_created: false,
        message: "No profile data"
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("ensureProfile exception:", err);
    // Return safe fallback instead of throwing
    return {
      id: "",
      email: "",
      username: null,
      member_code: "",
      referral_code: null,
      referred_by: null,
      role: "MEMBER",
      verified: false,
      is_profile_complete: false,
      created_at: "",
      updated_at: "",
      profile_created: false,
      message: "Exception occurred"
    };
  }
}

/**
 * Get navigation route based on profile - SAFE VERSION
 * Never throws errors, always returns fallback data
 */
export async function getNavigationRoute(): Promise<NavigationData> {
  try {
    const { data, error } = await supabase.rpc("get_navigation_route");
    
    if (error) {
      console.error("get_navigation_route failed", error);
      // Return safe fallback instead of throwing
      return {
        route: "/member/dashboard",
        reason: "fallback",
        profile_verified: false,
        user_role: "MEMBER"
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No navigation data returned");
      // Return safe fallback instead of throwing
      return {
        route: "/member/dashboard",
        reason: "fallback",
        profile_verified: false,
        user_role: "MEMBER"
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("getNavigationRoute exception:", err);
    // Return safe fallback instead of throwing
    return {
      route: "/member/dashboard",
      reason: "fallback",
      profile_verified: false,
      user_role: "MEMBER"
    };
  }
}

/**
 * Get profile with navigation info - SAFE VERSION
 * Never throws errors, always returns fallback data
 */
export async function getProfileWithNavigation(): Promise<ProfileWithNavigation> {
  try {
    const { data, error } = await supabase.rpc("get_profile_with_navigation");
    
    if (error) {
      console.error("get_profile_with_navigation failed", error);
      // Return safe fallback instead of throwing
      return {
        id: "",
        email: "",
        username: null,
        member_code: "",
        referral_code: null,
        referred_by: null,
        role: "MEMBER",
        verified: false,
        is_profile_complete: false,
        created_at: "",
        updated_at: "",
        profile_created: false,
        message: "Profile fetch failed",
        navigation_route: "/member/dashboard",
        navigation_reason: "fallback",
        can_access_admin: false,
        can_access_member: true
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No navigation data returned");
      // Return safe fallback instead of throwing
      return {
        id: "",
        email: "",
        username: null,
        member_code: "",
        referral_code: null,
        referred_by: null,
        role: "MEMBER",
        verified: false,
        is_profile_complete: false,
        created_at: "",
        updated_at: "",
        profile_created: false,
        message: "No profile data",
        navigation_route: "/member/dashboard",
        navigation_reason: "fallback",
        can_access_admin: false,
        can_access_member: true
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("getProfileWithNavigation exception:", err);
    // Return safe fallback instead of throwing
    return {
      id: "",
      email: "",
      username: null,
      member_code: "",
      referral_code: null,
      referred_by: null,
      role: "MEMBER",
      verified: false,
      is_profile_complete: false,
      created_at: "",
      updated_at: "",
      profile_created: false,
      message: "Exception occurred",
      navigation_route: "/member/dashboard",
      navigation_reason: "fallback",
      can_access_admin: false,
      can_access_member: true
    };
  }
}

/**
 * Update login activity - SAFE VERSION
 * Never throws errors, always returns fallback data
 */
export async function updateLoginActivity(): Promise<{
  ok: boolean;
  message: string;
  login_count: number;
  last_login: string;
}> {
  try {
    const { data, error } = await supabase.rpc("update_login_activity");
    
    if (error) {
      console.error("update_login_activity failed", error);
      // Return safe fallback instead of throwing
      return {
        ok: false,
        message: "Login activity update failed",
        login_count: 0,
        last_login: new Date().toISOString()
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No activity data returned");
      // Return safe fallback instead of throwing
      return {
        ok: false,
        message: "No activity data",
        login_count: 0,
        last_login: new Date().toISOString()
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("updateLoginActivity exception:", err);
    // Return safe fallback instead of throwing
    return {
      ok: false,
      message: "Exception occurred",
      login_count: 0,
      last_login: new Date().toISOString()
    };
  }
}

/**
 * Activate profile with username and referral - SAFE VERSION
 * Never throws errors, always returns fallback data
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
  try {
    const { data, error } = await supabase.rpc("activate_profile", {
      p_username: username,
      p_referral_code: referralCode || null
    });
    
    if (error) {
      console.error("activate_profile failed", error);
      // Return safe fallback instead of throwing
      return {
        ok: false,
        message: "Profile activation failed",
        navigation_route: "/member/dashboard",
        profile_status: "failed"
      };
    }
    
    if (!data || data.length === 0) {
      console.warn("No activation data returned");
      // Return safe fallback instead of throwing
      return {
        ok: false,
        message: "No activation data",
        navigation_route: "/member/dashboard",
        profile_status: "failed"
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("activateProfile exception:", err);
    // Return safe fallback instead of throwing
    return {
      ok: false,
      message: "Exception occurred",
      navigation_route: "/member/dashboard",
      profile_status: "failed"
    };
  }
}

/**
 * Validate referral code - SAFE VERSION
 * Never throws errors, always returns fallback data
 */
export async function validateReferralCode(code: string): Promise<{
  is_valid: boolean;
  referrer_id: string | null;
  referrer_username: string | null;
  referrer_member_code: string | null;
}> {
  try {
    const { data, error } = await supabase.rpc("validate_referral_code_public", {
      p_referral_code: code.trim().toUpperCase()
    });
    
    if (error) {
      console.error("validate_referral_code failed", error);
      // Return safe fallback instead of throwing
      return {
        is_valid: false,
        referrer_id: null,
        referrer_username: null,
        referrer_member_code: null
      };
    }
    
    if (!data || data.length === 0) {
      // Return safe fallback instead of throwing
      return {
        is_valid: false,
        referrer_id: null,
        referrer_username: null,
        referrer_member_code: null
      };
    }
    
    return data[0];
  } catch (err) {
    console.error("validateReferralCode exception:", err);
    // Return safe fallback instead of throwing
    return {
      is_valid: false,
      referrer_id: null,
      referrer_username: null,
      referrer_member_code: null
    };
  }
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
  } else if (!profile.verified) {
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
  
  return profile.verified && profile.is_profile_complete;
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
export function getProfileStatusColor(verified: boolean): string {
  return verified ? 'text-green-500' : 'text-yellow-500';
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
  return !profile.is_profile_complete || !profile.verified;
}
