import { translations, Language } from './translations';

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

export function getLanguageFromPath(pathname: string = window.location.pathname): Language {
  const m = pathname.match(/^\/(en|id)(\/|$)/);
  if (m) return m[1] as Language;
  return getStoredLanguage() ?? 'en';
}

export function stripLang(pathname: string): string {
  return pathname.replace(/^\/(en|id)(?=\/|$)/, '');
}

export function getLangPath(lang: Language, pathWithoutLang: string): string {
  const p = pathWithoutLang.startsWith('/') ? pathWithoutLang : `/${pathWithoutLang}`;
  return `/${lang}${p}`;
}

/**
 * Change language while staying on same page (preserve path after /en or /id).
 * MUST dispatch popstate to force App state refresh.
 */
export function setLanguage(newLang: Language, currentPath: string = window.location.pathname) {
  storeLanguage(newLang);

  const without = stripLang(currentPath);
  const next = getLangPath(newLang, without === '' ? '/home' : without);

  if (window.location.pathname !== next) {
    window.history.pushState({}, '', next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

export const useTranslations = (lang?: Language) => {
  const targetLang = lang || getLanguageFromPath();
  return translations[targetLang];
};

export const useLanguage = () => {
  const language = getLanguageFromPath();
  const t = useTranslations(language);
  return { language, t };
};

function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? path;
}

export const useI18n = (lang?: Language) => {
  const detectedLang = lang || getLanguageFromPath();
  const translations = useTranslations(detectedLang);
  const t = (path: string) => getNestedTranslation(translations, path);
  return { t, language: detectedLang };
};

export const defaultLanguage: Language = 'en';
