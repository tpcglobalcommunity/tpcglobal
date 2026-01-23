import { translations, Language } from './translations';
import { stripLang, ensureLangPath, getLanguageFromPath } from '../utils/langPath';

export type { Language };

const STORAGE_KEY = 'tpc_lang';

export function getStoredLanguage(): Language | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'en' || raw === 'id' ? raw : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export { getLanguageFromPath, stripLang };

// Legacy function for backward compatibility
export function getLangPath(lang: Language, pathWithoutLang: string): string {
  return ensureLangPath(lang, pathWithoutLang);
}

/**
 * Change language while staying on same page (preserve path after /en or /id).
 * MUST dispatch popstate to force App state refresh.
 */
export function setLanguage(newLang: Language, currentPath: string = window.location.pathname) {
  storeLanguage(newLang);

  const without = stripLang(currentPath);
  const next = ensureLangPath(newLang, without === '' ? '/home' : without);

  if (window.location.pathname !== next) {
    window.history.pushState({}, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export const useTranslations = (lang?: Language) => {
  const targetLang = lang || getLanguageFromPath(window.location.pathname);
  return translations[targetLang];
};

export const useLanguage = () => {
  const language = getLanguageFromPath(window.location.pathname);
  const t = useTranslations(language);
  const translate = (key: string, fallback?: string) => {
    const value = getNestedTranslation(t, key);
    return value !== null ? value : fallback;
  };
  return { language, t: translate };
};

function getNestedTranslation(obj: any, path: string): string | null {
  const result = path.split('.').reduce((acc, part) => acc?.[part], obj);
  if (result !== undefined && result !== null) {
    return result;
  }
  
  // Return null instead of fallback to humanized key
  return null;
}

export const useI18n = (lang?: Language) => {
  const detectedLang = lang || getLanguageFromPath(window.location.pathname);
  const currentTranslations = useTranslations(detectedLang);
  const enTranslations = translations.en; // Fallback ke EN
  
  const t = (key: string, fallback?: string) => {
    // Coba di current language
    const result = getNestedTranslation(currentTranslations, key);
    if (result !== null) {
      return result;
    }
    
    // Fallback ke EN
    const enResult = getNestedTranslation(enTranslations, key);
    if (enResult !== null) {
      return enResult;
    }
    
    // Last fallback - if no fallback provided, this will return undefined
    // which will cause the UI to fail rather than show placeholder text
    return fallback;
  };
  
  return { t, language: detectedLang };
};

export const defaultLanguage: Language = 'en';
