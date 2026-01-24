// src/i18n/index.ts (REPLACE ALL - SUPER LOCKED)

import { translations, Language } from "./translations";
import {
  getStoredLanguage,
  storeLanguage,
  detectLangFromPath,
  stripLangPrefix,
  collapseDoubleLang,
} from "@/utils/langPath";
import { resolvePath } from "./resolve";

export type { Language };
export { I18nProvider, useI18n } from "./context";
export { storeLanguage };

// ------------------------------------------------------------
// RULE: URL PREFIX ALWAYS WINS (STRICT)
// ------------------------------------------------------------
export function getLanguageFromPath(pathname?: string): Language {
  const p =
    pathname ??
    (typeof window !== "undefined" ? window.location.pathname : "");
  const m = p.match(/^\/(en|id)(\/|$)/);
  if (m) return m[1] as Language; // ✅ prefix always wins
  return getStoredLanguage() ?? "en";
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
export function stripLang(pathname: string): string {
  return stripLangPrefix(pathname);
}

/**
 * Ensures `to` has exactly ONE lang prefix.
 * - collapses "/en/en/.." -> "/en/.."
 * - if already has /en or /id prefix -> returns as-is (collapsed)
 * - if missing prefix -> adds "/{lang}"
 * - preserves internal "to" as path only (no query/hash handling here)
 */
export function ensureLangPath(lang: Language, to: string): string {
  const raw = to.startsWith("/") ? to : `/${to}`;
  const collapsed = collapseDoubleLang(raw);

  // if already prefixed, keep it
  const hasLang = detectLangFromPath(collapsed);
  if (hasLang) return collapsed.replace(/\/{2,}/g, "/");

  // add prefix
  const without = stripLangPrefix(collapsed);
  const clean = without.startsWith("/") ? without : `/${without}`;
  const out = `/${lang}${clean === "/" ? "" : clean}`.replace(/\/{2,}/g, "/");

  return collapseDoubleLang(out).replace(/\/{2,}/g, "/");
}

/**
 * Legacy alias: MUST be safe.
 * This function caused /en/en before because it blindly prepended.
 * Now it delegates to ensureLangPath.
 */
export function getLangPath(lang?: Language, pathWithoutLang?: string): string {
  const l = lang ?? getStoredLanguage() ?? "en";
  const p = pathWithoutLang ?? "/";
  return ensureLangPath(l, p);
}

// ------------------------------------------------------------
// Translation resolver
// ------------------------------------------------------------
export function t(key: string, lang?: Language): string | any {
  const l = lang ?? getLanguageFromPath();
  const dict = translations[l] ?? translations.en;

  // Resolve primary language
  let value = resolvePath(dict, key);
  if (value !== undefined) return value;

  // Fallback to English
  value = resolvePath(translations.en, key);
  if (value !== undefined) return value;

  // Debug fallback
  return key;
}

// Legacy compatibility exports
export function tStr(key: string, fallback?: string, lang?: Language): string {
  const v = t(key, lang);
  if (typeof v === "string" && v.length) return v;
  return fallback || key;
}

export function tArr(key: string, lang?: Language): string[] {
  const result = t(key, lang);

  if (typeof result === "string") {
    if (result.includes("\n")) {
      return result
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (result.includes("|")) {
      return result
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return result.trim() ? [result.trim()] : [];
  }

  return Array.isArray(result) ? result : [];
}

export function useTranslations() {
  const language = getLanguageFromPath();
  return {
    language,
    setLanguage: storeLanguage,
    t: (key: string) => t(key, language),
    tStr: (key: string, fallback?: string) => tStr(key, fallback, language),
    tArr: (key: string) => tArr(key, language),
  };
}
