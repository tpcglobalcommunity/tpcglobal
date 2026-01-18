import { translations, Language } from './translations';

export const defaultLanguage: Language = 'en';

export const getLanguageFromPath = (): Language => {
  const path = window.location.pathname;
  if (path.startsWith('/id')) return 'id';
  if (path.startsWith('/en')) return 'en';
  return defaultLanguage;
};

export const setLanguage = (lang: Language, currentPath: string) => {
  const pathWithoutLang = currentPath.replace(/^\/(en|id)/, '');
  const newPath = `/${lang}${pathWithoutLang || '/home'}`;
  window.location.pathname = newPath;
};

export const useTranslations = (lang: Language) => {
  return translations[lang];
};

export const getLangPath = (lang: Language, path: string) => {
  return `/${lang}${path}`;
};
