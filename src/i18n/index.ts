import { translations, Language } from "./translations";
import { 
  getStoredLanguage, 
  storeLanguage, 
  detectLangFromPath, 
  stripLangPrefix, 
  collapseDoubleLang 
} from "../utils/langPath";
import { resolvePath } from "./resolve";
export type { Language };

export { I18nProvider, useI18n } from "./context";
export { storeLanguage };

// URL PREFIX ALWAYS WINS - STRICT RULE
export function getLanguageFromPath(pathname?: string): Language {
  const p = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const m = p.match(/^\/(en|id)(\/|$)/);
  if (m) return m[1] as Language;          // ✅ PREFIX ALWAYS WINS
  return getStoredLanguage() ?? "en";      // fallback only
}

export function stripLang(pathname: string): string {
  return stripLangPrefix(pathname);
}

// Anti /en/en: jika sudah ada prefix, jangan ditambah lagi
export function ensureLangPath(lang: Language, to: string): string {
  const raw = to.startsWith("/") ? to : `/${to}`;
  const collapsed = collapseDoubleLang(raw);
  const hasLang = detectLangFromPath(collapsed);
  if (hasLang) return collapsed;

  const without = stripLangPrefix(collapsed);
  const clean = without.startsWith("/") ? without : `/${without}`;
  return `/${lang}${clean === "/" ? "" : clean}`.replace(/\/{2,}/g, "/");
}

// Legacy compatibility: getLangPath alias
export function getLangPath(lang: Language, pathWithoutLang: string): string {
  const clean = pathWithoutLang.startsWith("/") ? pathWithoutLang.slice(1) : pathWithoutLang;
  return `/${lang}/${clean}`;
}

// t() resolver: handles both strings, nested objects, and array indices
export function t(key: string, lang?: Language): string | any {
  const l = lang ?? getLanguageFromPath();
  const dict = translations[l] ?? translations.en;
  
  // Try to resolve with bracket support
  let value = resolvePath(dict, key);
  
  if (value !== undefined) {
    return value;
  }
  
  // Fallback to English with bracket support
  const enDict = translations.en;
  value = resolvePath(enDict, key);
  
  if (value !== undefined) {
    return value;
  }
  
  // Return key for debugging if not found
  return key;
}

// Legacy compatibility exports
export function tStr(key: string, fallback?: string, lang?: Language): string {
  return t(key, lang) || fallback || key;
}

export function tArr(key: string, lang?: Language): string[] {
  const result = t(key, lang);
  // Try to split by common delimiters if it's a string
  if (typeof result === 'string') {
    if (result.includes('\n')) {
      return result.split('\n').map((s: string) => s.trim()).filter(Boolean);
    }
    if (result.includes('|')) {
      return result.split('|').map((s: string) => s.trim()).filter(Boolean);
    }
  }
  // Return as array if it's already an array, or empty array
  return Array.isArray(result) ? result : [];
}

export function useTranslations() {
  const language = getLanguageFromPath();
  return {
    language,
    setLanguage: storeLanguage,
    t: (key: string) => t(key, language),
    tStr: (key: string, fallback?: string) => tStr(key, fallback, language),
    tArr: (key: string) => tArr(key, language)
  };
}
