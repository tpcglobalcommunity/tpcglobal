import { getAppSettings } from "./supabase";

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
    try {
      // Use safe getAppSettings with fallback
      const settings = await getAppSettings();
      
      // Convert to AppSettings format
      cache = {
        app_name: settings.app_name || 'TPC Global',
        app_version: settings.version || '1.0.0',
        maintenance_mode: settings.maintenance_mode === 'true',
        registration_enabled: true,
        verification_enabled: true,
        max_upload_size_mb: 10,
        supported_languages: ['en', 'id'],
        default_language: 'en',
        telegram_community: 'https://t.me/tpcglobal',
        created_at: new Date().toISOString(),
        registrations_open: true,
        referral_enabled: true,
        referral_invite_limit: 10,
        default_member_status: 'ACTIVE',
      };
      
      cacheAt = now;
      return cache;
    } catch (error: any) {
      console.error('Failed to fetch app settings:', error);
      
      // Return fallback settings
      cache = {
        app_name: 'TPC Global',
        app_version: '1.0.0',
        maintenance_mode: false,
        registration_enabled: true,
        verification_enabled: true,
        max_upload_size_mb: 10,
        supported_languages: ['en', 'id'],
        default_language: 'en',
        telegram_community: 'https://t.me/tpcglobal',
        created_at: new Date().toISOString(),
        registrations_open: true,
        referral_enabled: true,
        referral_invite_limit: 10,
        default_member_status: 'ACTIVE',
      };
      
      cacheAt = now;
      return cache;
    } finally {
      inFlight = null;
    }
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
