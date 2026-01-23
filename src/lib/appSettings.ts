export type AppSettings = Record<string, any>;

let cache: AppSettings | null = null;
let inflight: Promise<AppSettings> | null = null;

// Helper untuk konversi boolean yang STRICT
function toBooleanStrict(value: any): boolean {
  // Return true hanya untuk nilai yang secara eksplisit true
  if (value === true) return true;
  if (value === "true") return true;
  if (value === 1) return true;
  if (value === "1") return true;
  // Semua nilai lain (false, "false", 0, "0", null, undefined, dll) = false
  return false;
}

// Helper untuk normalisasi app settings dengan strict boolean conversion
// SINGLE SOURCE OF TRUTH — DO NOT DUPLICATE
function normalizeAppSettings(raw: any): AppSettings {
  const normalized: AppSettings = {};
  
  for (const [key, value] of Object.entries(raw || {})) {
    // Normalisasi field boolean penting
    if (key === 'maintenance_mode' || key === 'maintenance' || key === 'registrations_open' || key === 'referral_enabled') {
      normalized[key] = toBooleanStrict(value);
    } else {
      normalized[key] = value;
    }
  }
  
  // Pastikan field penting selalu ada dengan default AMAN
  // MAINTENANCE FLAG: HARUS false sebagai safe default
  if (typeof normalized.maintenance_mode === 'undefined') {
    normalized.maintenance_mode = false;
  }
  if (typeof normalized.registrations_open === 'undefined') {
    normalized.registrations_open = true;
  }
  if (typeof normalized.referral_enabled === 'undefined') {
    normalized.referral_enabled = true;
  }
  
  return normalized;
}

// Default fallback yang AMAN (maintenance HARUS false)
const DEFAULT_SETTINGS: AppSettings = {
  signup_enabled: true,
  referral_required: true,
  maintenance_mode: false,
  registrations_open: true,
  referral_enabled: true
};

function isRpcNotFound(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  return msg.includes("404") || msg.includes("not found") || msg.includes("function");
}

export async function getAppSettings(supabase: any): Promise<AppSettings> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async (): Promise<AppSettings> => {
    let raw: any = null;
    let source: 'RPC' | 'TABLE' | 'DEFAULT' = 'DEFAULT';

    try {
      // DEV LOG: Track Supabase URL (once)
      if (!(window as any).__SUPABASE_SETTINGS_LOGGED__) {
        console.info('[SUPABASE_ACTIVE_URL]', import.meta.env.VITE_SUPABASE_URL);
        (window as any).__SUPABASE_SETTINGS_LOGGED__ = true;
      }
      
      // 1) Prefer RPC
      const { data, error } = await supabase.rpc("get_app_settings");
      if (!error && data && typeof data === "object") {
        raw = data;
        source = 'RPC';
      }

      // 2) Fallback table read (public-only)
      if (error && isRpcNotFound(error)) {
        const { data: rows, error: err2 } = await supabase
          .from("app_settings")
          .select("key,value,is_public")
          .eq("is_public", true);

        if (!err2 && Array.isArray(rows)) {
          const obj: any = {};
          for (const r of rows) obj[r.key] = r.value;
          raw = obj;
          source = 'TABLE';
        }
      }

      // 3) Normalize and cache
      let final: AppSettings;
      if (raw) {
        final = normalizeAppSettings(raw);
        const DEBUG = import.meta.env.DEV && localStorage.getItem("tpc_debug") === "1";
        if (DEBUG) {
          console.log('[APP_SETTINGS_RAW]', raw);
          console.log('[APP_SETTINGS_FINAL]', final);
          console.log('[APP_SETTINGS_SOURCE]', source);
        }
      } else {
        final = { ...DEFAULT_SETTINGS };
        source = 'DEFAULT';
        const DEBUG = import.meta.env.DEV && localStorage.getItem("tpc_debug") === "1";
        if (DEBUG) {
          console.log('[APP_SETTINGS_RAW]', null);
          console.log('[APP_SETTINGS_FINAL]', final);
          console.log('[APP_SETTINGS_SOURCE]', source);
        }
      }

      cache = final;
      return final;
    } catch {
      // Return default settings yang AMAN - NETRAL
      const final = { ...DEFAULT_SETTINGS };
      cache = final;
      const DEBUG = import.meta.env.DEV && localStorage.getItem("tpc_debug") === "1";
      if (DEBUG) {
        console.log('[APP_SETTINGS_RAW]', null);
        console.log('[APP_SETTINGS_FINAL]', final);
        console.log('[APP_SETTINGS_SOURCE]', 'DEFAULT_ERROR');
      }
      return final;
    } finally {
      inflight = null;
    }
  })();

  return inflight!;
}

export function resetAppSettingsCache() {
  cache = null;
  inflight = null;
}
