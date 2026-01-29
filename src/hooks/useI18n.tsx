import { useState, useEffect } from 'react';
import { copy } from '../i18n/copy';
import type { Language } from '../i18n/i18n';
import { normalizeLang, withLang, getLangFromPath } from '../i18n/i18n';

interface UseI18nReturn {
  lang: Language;
  t: (key: string) => any;
  setLang: (lang: Language) => void;
  withLang: (path: string) => string;
}

export function useI18n(initialLang?: Language): UseI18nReturn {
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    
    // Try to get language from URL path
    if (typeof window !== 'undefined') {
      const pathLang = getLangFromPath(window.location.pathname);
      return pathLang;
    }
    
    return 'id'; // Default to Indonesian
  });

  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = copy[lang];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = copy.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return value;
  };

  const setLang = (newLang: Language) => {
    const normalizedLang = normalizeLang(newLang);
    setLangState(normalizedLang);
    
    // Update URL if in browser
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const pathWithoutLang = currentPath.replace(/^\/(en|id)/, '');
      const newPath = withLang(pathWithoutLang || '/', normalizedLang);
      window.history.replaceState(null, '', newPath);
    }
  };

  const withLangPath = (path: string): string => {
    return withLang(path, lang);
  };

  // Update language when URL changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const pathLang = getLangFromPath(window.location.pathname);
        setLangState(pathLang);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  return {
    lang,
    t,
    setLang,
    withLang: withLangPath,
  };
}
