import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Language, getLanguageFromPath, storeLanguage, t } from "./index";

type I18nCtx = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(() => getLanguageFromPath());

  useEffect(() => {
    // keep in sync if URL changes via navigation
    const next = getLanguageFromPath();
    if (next !== language) setLang(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof window !== "undefined" ? window.location.pathname : ""]);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    storeLanguage(lang);
  }, []);

  const value = useMemo<I18nCtx>(() => {
    return {
      language,
      setLanguage,
      t: (key: string, fallback?: string) => t(key, fallback, language),
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // fallback safe (so it never crashes even if provider is missing)
    const fallbackLang = getLanguageFromPath();
    return {
      language: fallbackLang,
      setLanguage: (l: Language) => storeLanguage(l),
      t: (key: string, fallback?: string) => t(key, fallback, fallbackLang),
    };
  }
  return ctx;
}
