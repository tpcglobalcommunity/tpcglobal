import { Profile } from './supabase';

// Interface for useProfileStatus
export interface ProfileData {
  full_name: string | null;
  phone: string | null;
  telegram: string | null;
  city: string | null;
  profile_completed: boolean;
  wallet_address: string | null;
  tpc_balance: number | null;
  role: string | null;
  verified: boolean | null;
}

/**
 * Check if user profile is complete with required fields
 * Required fields: full_name, phone, telegram, city
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false;
  
  const requiredFields: (keyof Profile)[] = ['full_name', 'phone', 'telegram', 'city'];
  
  return requiredFields.every(field => {
    const value = profile[field];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
}

/**
 * Check if ProfileData is complete (for useProfileStatus hook)
 */
export function isProfileDataComplete(profile: ProfileData | null): boolean {
  if (!profile) return false;
  
  // Check if profile is verified and not a viewer
  return profile.verified === true && profile.role !== 'viewer';
}

/**
 * Get missing required fields from profile
 */
export function getMissingProfileFields(profile: Profile | null): string[] {
  if (!profile) return ['Full Name', 'Phone Number', 'Telegram Username', 'City'];
  
  const requiredFields: (keyof Profile)[] = ['full_name', 'phone', 'telegram', 'city'];
  const fieldLabels: Record<string, string> = {
    full_name: 'Full Name',
    phone: 'Phone Number',
    telegram: 'Telegram Username',
    city: 'City'
  };
  
  return requiredFields.filter(field => {
    const value = profile[field];
    return !value || typeof value !== 'string' || value.trim().length === 0;
  }).map(field => fieldLabels[field]);
}
