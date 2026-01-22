// Safe Profile Fetch - Emergency Fix for Production
// This module provides safe profile fetching with comprehensive error handling

import { supabase } from './supabase';

export interface SafeProfile {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  role: string;
  verified: boolean;
  can_invite: boolean;
  tpc_tier: string;
  tpc_balance: number;
  wallet_address: string | null;
  wallet_verified_at: string | null;
  created_at: string;
}

/**
 * Safe profile fetch with comprehensive error handling
 * Never throws errors, always returns fallback data
 */
export async function safeFetchProfile(userId: string): Promise<SafeProfile | null> {
  try {
    console.log('🔧 [safeFetchProfile] Fetching profile for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,username,full_name,role,verified,can_invite,tpc_tier,tpc_balance,wallet_address,wallet_verified_at,created_at')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors

    if (error) {
      console.error('❌ [safeFetchProfile] Database error:', error);
      return null;
    }

    if (!data) {
      console.warn('⚠️ [safeFetchProfile] No profile found for user:', userId);
      return null;
    }

    console.log('✅ [safeFetchProfile] Profile loaded successfully');
    return data as SafeProfile;
  } catch (err: any) {
    console.error('❌ [safeFetchProfile] Exception:', err);
    return null;
  }
}

/**
 * Safe role and verified fetch
 */
export async function safeFetchRoleAndVerified(userId: string): Promise<{ role: string; verified: boolean }> {
  try {
    console.log('🔧 [safeFetchRoleAndVerified] Fetching role/verified for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role,verified')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors

    if (error) {
      console.error('❌ [safeFetchRoleAndVerified] Database error:', error);
      return { role: 'viewer', verified: false };
    }

    if (!data) {
      console.warn('⚠️ [safeFetchRoleAndVerified] No profile found for user:', userId);
      return { role: 'viewer', verified: false };
    }

    console.log('✅ [safeFetchRoleAndVerified] Role/verified loaded:', { role: data.role, verified: data.verified });
    return {
      role: data.role || 'viewer',
      verified: !!data.verified
    };
  } catch (err: any) {
    console.error('❌ [safeFetchRoleAndVerified] Exception:', err);
    return { role: 'viewer', verified: false };
  }
}

/**
 * Global error handler for profile operations
 */
export function handleProfileError(error: any, context: string): void {
  console.error(`❌ [Profile Error] ${context}:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint
  });
  
  // Never throw errors in production, just log them
  // This prevents UI crashes
}
