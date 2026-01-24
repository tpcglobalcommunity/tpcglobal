import type { PostgrestError } from "@supabase/supabase-js";

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
