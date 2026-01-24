import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export const REQUIRED_PROFILE_FIELDS = ["full_name", "phone", "telegram", "city"] as const;
export type RequiredProfileField = (typeof REQUIRED_PROFILE_FIELDS)[number];

export type MinimalProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  telegram?: string | null;
  city?: string | null;
  role?: string | null;
  verified?: boolean | null;
};

export function debugLog(scope: string, message: string, data?: any) {
  // Toggle debug with localStorage: localStorage.setItem("tpc_debug","1")
  try {
    const enabled = typeof window !== "undefined" && localStorage.getItem("tpc_debug") === "1";
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console.log(`[${scope}] ${message}`, data ?? "");
  } catch {}
}

export function formatSbError(err: unknown): string {
  const e = err as any;
  const msg =
    e?.message ||
    e?.error_description ||
    e?.details ||
    (typeof e === "string" ? e : "") ||
    "Unknown error";
  return String(msg);
}

export function computeProfileCompletion(profile: MinimalProfile | null | undefined): {
  isComplete: boolean;
  missing: RequiredProfileField[];
} {
  const p = profile ?? ({} as MinimalProfile);
  const missing = REQUIRED_PROFILE_FIELDS.filter((k) => {
    const v = (p as any)[k];
    return !v || String(v).trim().length === 0;
  });
  return { isComplete: missing.length === 0, missing };
}

export function isProfileComplete(profile: MinimalProfile | null | undefined): boolean {
  return computeProfileCompletion(profile).isComplete;
}

// Alias export to match the import name used in ProfileGate.tsx
export const isProfileDataComplete = isProfileComplete;

// Additional utility functions that might be needed
export function isUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function safeFetchProfile(userId: string): Promise<MinimalProfile | null> {
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
      .select('id,email,full_name,phone,telegram,city,role,verified')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('❌ [safeFetchProfile] Database error:', formatSbError(error));
      return null;
    }

    if (!data) {
      console.warn('⚠️ [safeFetchProfile] No profile found for user:', userId);
      return null;
    }

    debugLog('safeFetchProfile', 'Profile loaded successfully');
    return data as MinimalProfile;
  } catch (err: any) {
    console.error('❌ [safeFetchProfile] Exception:', formatSbError(err));
    return null;
  }
}