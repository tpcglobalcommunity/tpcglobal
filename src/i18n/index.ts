import { translations } from "./translations";
import type { Language } from "./translations";
import { useI18n } from "./context";

export type { Language };

// Simplified type to avoid deep inference
export type TranslationKey = string;

const STORAGE_KEY = "tpc_lang";

export function getStoredLanguage(): Language | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "en" || raw === "id" ? (raw as Language) : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export function setLanguage(lang: Language) {
  storeLanguage(lang);
}

export function getLanguageFromPath(pathname?: string): Language {
  const path = pathname || (typeof window !== "undefined" ? window.location.pathname : "");
  const m = path.match(/^\/(en|id)(\/|$)/);
  if (m) return m[1] as Language;
  return getStoredLanguage() ?? "en";
}

export function stripLang(pathname: string): string {
  return pathname.replace(/^\/(en|id)(?=\/|$)/, "");
}

export function getLangPath(lang: Language, pathWithoutLang: string): string {
  const clean = pathWithoutLang.startsWith("/") ? pathWithoutLang.slice(1) : pathWithoutLang;
  return `/${lang}/${clean}`;
}

// Helper type guards
function isRecord(v: unknown): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function safeString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return null;
}

function resolveAny(obj: any, path: string): any {
  if (!isRecord(obj)) return undefined;
  if (typeof path !== 'string' || !path.trim()) return undefined;
  
  const parts = path.split('.').filter(Boolean);
  let current = obj;
  
  for (const part of parts) {
    // Handle array indices like "cards[2]"
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayName, index] = arrayMatch;
      if (!isRecord(current) || !(arrayName in current)) {
        return undefined;
      }
      const array = current[arrayName];
      const arrayIndex = parseInt(index, 10);
      if (!Array.isArray(array) || arrayIndex >= array.length) {
        return undefined;
      }
      current = array[arrayIndex];
    } else {
      if (!isRecord(current) || !(part in current)) {
        return undefined;
      }
      current = current[part];
    }
  }
  
  return current;
}

export function t(key: TranslationKey, fallback?: string, lang?: Language): string {
  const targetLang = lang || getLanguageFromPath();
  const dict = (translations as any)[targetLang] ?? (translations as any).en;
  const value = resolveAny(dict, key);
  
  const stringResult = safeString(value);
  if (stringResult !== null) return stringResult;
  
  if (fallback) return fallback;
  console.warn(`[i18n] Missing key "${key}" for lang "${targetLang}"`);
  return typeof key === 'string' ? key : '';
}

// Re-export React components from context.tsx
export { useI18n, I18nProvider } from "./context";

// Legacy compatibility exports
export { translations } from "./translations";

// Compatibility helper functions
export function tStr(key: string, fallback?: string, lang?: Language): string {
  const targetLang = lang || getLanguageFromPath();
  const dict = (translations as any)[targetLang] ?? (translations as any).en;
  const value = resolveAny(dict, key);
  
  const stringResult = safeString(value);
  if (stringResult !== null) return stringResult;
  
  return fallback || key;
}

export function tArr(key: string, lang?: Language): string[] {
  const targetLang = lang || getLanguageFromPath();
  const dict = (translations as any)[targetLang] ?? (translations as any).en;
  const value = resolveAny(dict, key);
  
  // If it's already an array, ensure all elements are strings
  if (Array.isArray(value)) {
    return value.map(item => safeString(item) || '').filter(Boolean);
  }
  
  // If it's a string, try to split it
  const stringResult = safeString(value);
  if (stringResult !== null) {
    // Try common delimiters
    if (stringResult.includes('\n')) {
      return stringResult.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (stringResult.includes('|')) {
      return stringResult.split('|').map(s => s.trim()).filter(Boolean);
    }
    // Single item array
    return [stringResult.trim()].filter(Boolean);
  }
  
  // Missing or invalid value
  return [];
}

// Legacy compatibility alias
export function useTranslations() {
  // Fallback implementation - doesn't need React context
  const language = getLanguageFromPath();
  return {
    language,
    setLanguage,
    t: (key: string) => t(key, undefined, language),
    tStr: (key: string, fallback?: string) => tStr(key, fallback, language),
    tArr: (key: string) => tArr(key, language)
  };
}

// Compatibility export for useLanguage
export function useLanguage() {
  const { language, setLanguage } = useI18n();
  return { language, setLanguage };
}
