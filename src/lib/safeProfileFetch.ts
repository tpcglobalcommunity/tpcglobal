// Safe Profile Fetch - Emergency Fix for Production
// This module provides safe profile fetching with comprehensive error handling

import { supabase } from './supabase';
import { isUuid, formatSbError, debugLog } from './profileHelpers';

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
    debugLog('safeFetchProfile', 'Starting fetch for', userId);
    
    // Validate UUID before making request
    if (!userId || !isUuid(userId)) {
      debugLog('safeFetchProfile', 'Invalid UUID, returning null');
      return null;
    }

    // Check session before fetching
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user?.id) {
      debugLog('safeFetchProfile', 'No session found, returning null');
      return null;
    }

    debugLog('safeFetchProfile', 'Querying profiles table', { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,username,full_name,role,verified,can_invite,tpc_tier,tpc_balance,wallet_address,wallet_verified_at,created_at')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors

    if (error) {
      console.error('❌ [safeFetchProfile] Database error:', formatSbError(error));
      return null;
    }

    if (!data) {
      console.warn('⚠️ [safeFetchProfile] No profile found for user:', userId);
      return null;
    }

    debugLog('safeFetchProfile', 'Profile loaded successfully');
    return data as SafeProfile;
  } catch (err: any) {
    console.error('❌ [safeFetchProfile] Exception:', formatSbError(err));
    return null;
  }
}

/**
 * Safe role and verified fetch
 */
export async function safeFetchRoleAndVerified(userId: string): Promise<{ role: string; verified: boolean }> {
  try {
    debugLog('safeFetchRoleAndVerified', 'Starting fetch for', userId);
    
    // Validate UUID before making request
    if (!userId || !isUuid(userId)) {
      debugLog('safeFetchRoleAndVerified', 'Invalid UUID, returning fallback');
      return { role: 'viewer', verified: false };
    }

    // Check session before fetching
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user?.id) {
      debugLog('safeFetchRoleAndVerified', 'No session found, returning fallback');
      return { role: 'viewer', verified: false };
    }

    debugLog('safeFetchRoleAndVerified', 'Querying profiles table for role/verified', { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role,verified')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid errors

    if (error) {
      console.error('❌ [safeFetchRoleAndVerified] Database error:', formatSbError(error));
      return { role: 'viewer', verified: false };
    }

    if (!data) {
      console.warn('⚠️ [safeFetchRoleAndVerified] No profile found for user:', userId);
      return { role: 'viewer', verified: false };
    }

    debugLog('safeFetchRoleAndVerified', 'Role/verified loaded:', { role: data.role, verified: data.verified });
    return {
      role: data.role || 'viewer',
      verified: !!data.verified
    };
  } catch (err: any) {
    console.error('❌ [safeFetchRoleAndVerified] Exception:', formatSbError(err));
    return { role: 'viewer', verified: false };
  }
}

/**
 * Global error handler for profile operations
 */
export function handleProfileError(error: any, context: string): void {
  console.error(`❌ [Profile Error] ${context}:`, formatSbError(error));
  
  // Never throw errors in production, just log them
  // This prevents UI crashes
}
