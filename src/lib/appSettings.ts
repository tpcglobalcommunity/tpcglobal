// Resilient App Settings Module - Production Ready
// Handles caching, deduplication, and graceful fallbacks

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface AppSettings {
  maintenance?: boolean;
  version?: string;
  app_name?: string;
  registration_enabled?: boolean;
  verification_enabled?: boolean;
  notifications_enabled?: boolean;
  site?: {
    en?: { title?: string; subtitle?: string; };
    id?: { title?: string; subtitle?: string; };
  };
  [key: string]: any;
}

// Cache and deduplication state
let cache: AppSettings | null = null;
let cacheAt = 0;
let inFlight: Promise<AppSettings> | null = null;

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_SETTINGS: AppSettings = {
  maintenance: false,
  version: '1.0.0',
  app_name: 'TPC Global',
  registration_enabled: true,
  verification_enabled: true,
  notifications_enabled: false,
  site: {
    en: { title: 'TPC Global', subtitle: 'Trader Professional Community' },
    id: { title: 'TPC Global', subtitle: 'Komunitas Trader Profesional' }
  }
};

/**
 * Fetch app settings with caching and deduplication
 * Never throws, always returns safe defaults
 */
export async function fetchAppSettings(force = false): Promise<AppSettings> {
  const now = Date.now();

  // Return cached data if valid and not forced
  if (!force && cache && now - cacheAt < TTL_MS) {
    console.log(' [fetchAppSettings] Using cached settings');
    return cache;
  }

  // Return existing in-flight promise
  if (!force && inFlight) {
    console.log(' [fetchAppSettings] Using in-flight promise');
    return inFlight;
  }

  // Create new fetch promise
  inFlight = (async () => {
    try {
      console.log(' [fetchAppSettings] Fetching from RPC...');
      
      const { data, error } = await supabase.rpc('get_app_settings');
      
      if (error) {
        console.warn(' [fetchAppSettings] RPC failed:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // Return default settings on any error
        cache = DEFAULT_SETTINGS;
        cacheAt = now;
        return DEFAULT_SETTINGS;
      }

      if (!data) {
        console.warn(' [fetchAppSettings] No data returned');
        cache = DEFAULT_SETTINGS;
        cacheAt = now;
        return DEFAULT_SETTINGS;
      }

      // Parse and cache the result
      const settings = typeof data === 'object' ? data : DEFAULT_SETTINGS;
      cache = { ...DEFAULT_SETTINGS, ...settings };
      cacheAt = now;
      
      console.log(' [fetchAppSettings] Settings loaded:', cache);
      return cache;
      
    } catch (err: any) {
      console.error(' [fetchAppSettings] Exception:', {
        message: err.message,
        stack: err.stack
      });
      
      // Always return safe defaults on exceptions
      cache = DEFAULT_SETTINGS;
      cacheAt = now;
      return DEFAULT_SETTINGS;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight!;
}

/**
 * Get cached settings without fetching
 */
export function getCachedSettings(): AppSettings | null {
  return cache;
}

/**
 * Clear settings cache
 */
export function clearSettingsCache(): void {
  cache = null;
  cacheAt = 0;
  inFlight = null;
}

/**
 * Check if maintenance mode is enabled
 */
export function isMaintenanceMode(): boolean {
  return cache?.maintenance === true;
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  return cache?.version || DEFAULT_SETTINGS.version || '1.0.0';
}

/**
 * React hook for app settings
 */
export function useAppSettings(force = false): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setLoading(true);
      try {
        const result = await fetchAppSettings(force);
        if (mounted) {
          setSettings(result);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [force]);

  return settings;
}
