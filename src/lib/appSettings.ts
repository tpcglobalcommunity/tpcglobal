export type AppSettings = Record<string, any>;

let cache: AppSettings | null = null;
let inflight: Promise<AppSettings> | null = null;

// Default fallback untuk mencegah crash signup
const DEFAULT_SETTINGS: AppSettings = {
  signup_enabled: { enabled: true },
  referral_required: { required: true },
  maintenance_mode: { enabled: false }
};

function isRpcNotFound(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  return msg.includes("404") || msg.includes("not found") || msg.includes("function");
}

export async function getAppSettings(supabase: any): Promise<AppSettings> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async (): Promise<AppSettings> => {
    try {
      // 1) Prefer RPC
      const { data, error } = await supabase.rpc("get_app_settings");
      if (!error && data && typeof data === "object") {
        cache = data as AppSettings;
        return cache;
      }

      // 2) Fallback table read (public-only)
      if (error && isRpcNotFound(error)) {
        const { data: rows, error: err2 } = await supabase
          .from("app_settings")
          .select("key,value,is_public")
          .eq("is_public", true);

        if (!err2 && Array.isArray(rows)) {
          const obj: AppSettings = {};
          for (const r of rows) obj[r.key] = r.value;
          cache = obj;
          return cache;
        }
      }

      cache = {};
      return cache;
    } catch {
      // Return default settings untuk mencegah crash
      cache = DEFAULT_SETTINGS;
      return cache;
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
