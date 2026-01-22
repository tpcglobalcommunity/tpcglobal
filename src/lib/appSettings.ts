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
  site_name?: {
    en?: string;
    id?: string;
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
  site_name: {
    en: 'TPC Global',
    id: 'TPC Global'
  }
};

/**
 * Fetch app settings with RPC first, fallback to table query
 * Never throws, always returns safe defaults
 */
export async function fetchAppSettings(force = false): Promise<AppSettings> {
  const now = Date.now();

  // Return cached data if valid and not forced
  if (!force && cache && now - cacheAt < TTL_MS) {
    console.log('🔧 [fetchAppSettings] Using cached settings');
    return cache;
  }

  // Return existing in-flight promise
  if (!force && inFlight) {
    console.log('🔧 [fetchAppSettings] Using in-flight promise');
    return inFlight;
  }

  // Create new fetch promise
  inFlight = (async () => {
    try {
      console.log('🔧 [fetchAppSettings] Fetching from RPC...');
      
      // Try RPC first
      const { data, error } = await supabase.rpc('get_app_settings');
      
      if (error) {
        console.warn('⚠️ [fetchAppSettings] RPC failed, falling back to table query:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // Fallback to table query
        return await fetchFromTable();
      }

      if (!data) {
        console.warn('⚠️ [fetchAppSettings] No data from RPC, falling back to table query');
        return await fetchFromTable();
      }

      // Parse and cache the result
      const settings = typeof data === 'object' ? data : DEFAULT_SETTINGS;
      cache = { ...DEFAULT_SETTINGS, ...settings };
      cacheAt = now;
      
      console.log('✅ [fetchAppSettings] Settings loaded from RPC:', cache);
      return cache;
      
    } catch (err: any) {
      console.error('❌ [fetchAppSettings] Exception:', {
        message: err.message,
        stack: err.stack
      });
      
      // Always return safe defaults on exceptions
      return await fetchFromTable();
    } finally {
      inFlight = null;
    }
  })();

  return inFlight!;
}

/**
 * Fallback: fetch from app_settings table directly
 */
async function fetchFromTable(): Promise<AppSettings> {
  try {
    console.log('🔧 [fetchFromTable] Querying app_settings table...');
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('is_public', true);
    
    if (error) {
      console.warn('⚠️ [fetchFromTable] Table query failed, using defaults:', error);
      cache = DEFAULT_SETTINGS;
      cacheAt = Date.now();
      return DEFAULT_SETTINGS;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ [fetchFromTable] No data in table, using defaults');
      cache = DEFAULT_SETTINGS;
      cacheAt = Date.now();
      return DEFAULT_SETTINGS;
    }

    // Convert array to object
    const settings = data.reduce((acc, row) => {
      try {
        const value = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        acc[row.key] = value;
      } catch (e) {
        console.warn(`⚠️ [fetchFromTable] Failed to parse value for key ${row.key}:`, e);
      }
      return acc;
    }, {} as AppSettings);

    cache = { ...DEFAULT_SETTINGS, ...settings };
    cacheAt = Date.now();
    
    console.log('✅ [fetchFromTable] Settings loaded from table:', cache);
    return cache;
    
  } catch (err: any) {
    console.error('❌ [fetchFromTable] Exception:', err);
    cache = DEFAULT_SETTINGS;
    cacheAt = Date.now();
    return DEFAULT_SETTINGS;
  }
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
