// TPC Global Site Configuration
// STRICT: Only use this domain for all URLs and redirects

export const PRIMARY_SITE_URL = "https://tpcglobal.io";

export const SITE_CONFIG = {
  name: "TPC Global",
  url: PRIMARY_SITE_URL,
  description: "TPC Global - Transparent Presale Platform",
  defaultLang: "id" as const,
  supportedLangs: ["id", "en"] as const,
};

// Auth redirect URLs - NEVER use window.location.origin
export const getAuthRedirectUrl = (path: string = "/") => {
  return `${PRIMARY_SITE_URL}${path}`;
};
