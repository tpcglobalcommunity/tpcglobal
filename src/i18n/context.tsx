import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";
import type { Language } from "./translations";
import { getStoredLanguage, storeLanguage } from "@/utils/langPath";
import { resolvePath } from "./resolve";
import "./validation"; // Auto-run validation in development

// Dedupe missing key warnings
const __missingKeys = new Set<string>();

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
  tStr: (key: string, fallback?: string) => string;
  tArr: (key: string) => string[];
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getLangFromPath(pathname?: string): Language {
  const p = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const m = p.match(/^\/(en|id)(\/|$)/);
  if (m) return m[1] as Language;       // URL PREFIX ALWAYS WINS
  const stored = getStoredLanguage();
  return stored ?? "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getLangFromPath());

  // Sync language with URL (popstate)
  useEffect(() => {
    const syncFromUrl = () => {
      const next = getLangFromPath(window.location.pathname);
      setLanguageState(next);
      storeLanguage(next);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
  };

  const api = useMemo<I18nContextValue>(() => {
    const dict = translations[language] ?? translations.en;

    const t = (key: string) => {
      let v = resolvePath(dict, key);

      // fallback ke EN
      if (v === undefined && language !== "en") {
        v = resolvePath(translations.en, key);
      }

      // FREEZE: kalau tetap undefined, JANGAN kembalikan key.
      if (v === undefined) {
        // dev-only warning, sekali per key
        if (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) {
          const tag = `[i18n missing] ${language}:${key}`;
          if (!__missingKeys.has(tag)) {
            __missingKeys.add(tag);
            console.warn(tag);
          }
        }
        
        // Return readable fallback based on key
        if (key.endsWith(".refNone")) {
          return language === "id" ? "Tanpa referral" : "No referral";
        }
        // Return last part of key as fallback
        return key.split('.').pop() || key;
      }

      return v;
    };

    const tStr = (key: string, fallback?: string) => {
      const v = t(key);
      if (typeof v === "string" && v.trim()) return v;
      return fallback ?? (key.split('.').pop() || key);
    };

    const tArr = (key: string) => {
      const v = t(key);
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === "string") {
        if (v.includes("\n")) return v.split("\n").map(s => s.trim()).filter(Boolean);
        if (v.includes("|")) return v.split("|").map(s => s.trim()).filter(Boolean);
      }
      return [];
    };

    return { language, setLanguage, t, tStr, tArr };
  }, [language]);

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
