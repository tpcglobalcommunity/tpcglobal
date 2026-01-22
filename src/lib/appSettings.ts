// Resilient App Settings Module - Production Ready
// Handles caching, deduplication, and graceful fallbacks

export type AppSettings = Record<string, any>;

let cache: AppSettings | null = null;
let inflight: Promise<AppSettings> | null = null;

function isRpcNotFound(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  return msg.includes("404") || msg.includes("not found") || msg.includes("function");
}

export async function getAppSettings(supabase: any): Promise<AppSettings> {
  // kalau sudah ada cache, langsung kembalikan
  if (cache) return cache;

  // kalau ada request yang sedang jalan, tunggu itu
  if (inflight) return inflight;

  const p = (async (): Promise<AppSettings> => {
    try {
      // Try RPC first
      const { data, error } = await supabase.rpc("get_app_settings");
      if (!error && data && typeof data === "object") {
        cache = data as AppSettings;
        return cache;
      }

      // fallback kalau RPC tidak ada / 404
      if (error && isRpcNotFound(error)) {
        try {
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
        } catch (tableErr) {
          // Fallback if is_public column doesn't exist
          try {
            const { data: rows, error: err3 } = await supabase
              .from("app_settings")
              .select("key,value");

            if (!err3 && Array.isArray(rows)) {
              const obj: AppSettings = {};
              for (const r of rows) obj[r.key] = r.value;
              cache = obj;
              return cache;
            }
          } catch (fallbackErr) {
            console.warn('All app_settings fallbacks failed:', fallbackErr);
          }
        }
      }

      // error lain: tetap jangan null
      cache = {};
      return cache;
    } catch (err) {
      console.warn('getAppSettings error:', err);
      cache = {};
      return cache;
    } finally {
      inflight = null; // penting: clear inflight
    }
  })();

  inflight = p;
  return p;
}

// optional kalau butuh reset saat signout
export function resetAppSettingsCache() {
  cache = null;
  inflight = null;
}
