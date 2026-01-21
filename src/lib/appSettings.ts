import { supabase } from "./supabase";

export type AppSettings = {
  app_name: string;
  app_version: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  verification_enabled: boolean;
  max_upload_size_mb: number;
  supported_languages: string[];
  default_language: string;
  telegram_community: string;
  created_at: string;
  // Global Banner
  global_banner_enabled?: boolean;
  global_banner_text?: string;
  // Maintenance
  maintenance_message?: string;
  // Legacy fields for SettingsPage compatibility
  registrations_open?: boolean;
  referral_enabled?: boolean;
  referral_invite_limit?: number;
  default_member_status?: string;
  id?: number;
  updated_at?: string;
  updated_by?: string | null;
};

let cache: AppSettings | null = null;
let cacheAt = 0;
let inFlight: Promise<AppSettings | null> | null = null;

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchAppSettings(force = false): Promise<AppSettings | null> {
  const now = Date.now();

  if (!force && cache && now - cacheAt < TTL_MS) {
    return cache;
  }

  if (!force && inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const { data, error } = await supabase.rpc("get_app_settings");
    if (error) throw error;

    cache = data || {} as AppSettings;
    cacheAt = Date.now();
    return cache;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function getCachedAppSettings() {
  return cache;
}
