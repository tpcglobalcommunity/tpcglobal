/**
 * Auth Redirect Helper - TPC Global
 * Production-safe redirect URL builder for Supabase Auth
 */

/**
 * Get base URL for auth redirects
 * Returns origin without trailing slash
 */
export function getAuthRedirectBase(): string {
  const origin = window.location.origin;
  
  // Guard: Production must not contain localhost
  if (import.meta.env.PROD && origin.includes('localhost')) {
    throw new Error('Invalid production origin: localhost detected in production');
  }
  
  // Remove trailing slash for consistency
  return origin.replace(/\/$/, '');
}

/**
 * Build auth redirect URL with path
 * @param path - Must start with "/" (e.g., "/auth/reset")
 * @returns Full redirect URL (e.g., "https://tpcglobal.io/auth/reset")
 */
export function buildAuthRedirect(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error('Auth redirect path must start with "/"');
  }
  
  const base = getAuthRedirectBase();
  return `${base}${path}`;
}

/**
 * Common auth redirect paths
 */
export const AUTH_PATHS = {
  RESET: '/auth/reset',
  VERIFY: '/auth/verify', 
  MAGIC: '/auth/magic',
  INVITE: '/auth/invite',
  CALLBACK: '/auth/callback'
} as const;
