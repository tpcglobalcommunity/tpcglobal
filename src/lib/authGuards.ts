import type { Language } from "../i18n";
import { ensureLangPath } from "../utils/langPath";

/**
 * Auth guard utilities (Vite/Cloudflare-safe)
 * - No `process` usage
 * - No SSR-unsafe direct assumptions
 * - Exports MUST match imports used by SignIn.tsx
 */

export type AuthState = "authenticated" | "unauthenticated";

export function getAuthState(user: any): AuthState {
  return user ? "authenticated" : "unauthenticated";
}

/**
 * Used by SignIn.tsx
 * Returns a lang-prefixed redirect path safely.
 */
export function getAuthRedirectPath(lang: Language, path: string): string {
  return ensureLangPath(lang, path);
}

/**
 * Optional helper for route protection usage.
 */
export function isAuthed(user: any): boolean {
  return Boolean(user);
}
