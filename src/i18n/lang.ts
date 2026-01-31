// Pure language utilities - NO React imports
// This file contains only language parsing and manipulation functions

export type Lang = "id" | "en";

export const SUPPORTED_LANGS: Lang[] = ["id", "en"];
export const DEFAULT_LANG: Lang = "id";

// Normalize language to supported values
export const normalizeLang = (lang: string | null | undefined): Lang => {
  if (!lang) return DEFAULT_LANG;
  const normalized = lang.toLowerCase();
  if (SUPPORTED_LANGS.includes(normalized as Lang)) {
    return normalized as Lang;
  }
  return DEFAULT_LANG;
};

// Add language prefix to path
export const withLang = (path: string, lang: Lang): string => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
};

// Extract language from pathname
export const extractLang = (pathname: string): { lang: Lang; path: string } => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && SUPPORTED_LANGS.includes(parts[0] as Lang)) {
    return {
      lang: parts[0] as Lang,
      path: "/" + parts.slice(1).join("/") || "/",
    };
  }
  return { lang: DEFAULT_LANG, path: pathname };
};
