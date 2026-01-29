import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { copy, Lang } from "./copy";

const SUPPORTED_LANGS: Lang[] = ["id", "en"];
const DEFAULT_LANG: Lang = "id";

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

// Get nested value from object by dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }
  
  return typeof current === "string" ? current : path;
};

interface I18nContextValue {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
  withLang: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang: extractedLang, path: currentPath } = extractLang(location.pathname);
  const [lang, setLangState] = useState<Lang>(extractedLang);

  // Sync lang with URL
  useEffect(() => {
    const { lang: urlLang } = extractLang(location.pathname);
    if (urlLang !== lang) {
      setLangState(urlLang);
    }
  }, [location.pathname, lang]);

  const setLang = useCallback(
    (newLang: Lang) => {
      if (newLang !== lang) {
        setLangState(newLang);
        navigate(withLang(currentPath, newLang), { replace: true });
      }
    },
    [lang, currentPath, navigate]
  );

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(copy[lang] as unknown as Record<string, unknown>, key);
    },
    [lang]
  );

  const withLangFn = useCallback(
    (path: string): string => {
      return withLang(path, lang);
    },
    [lang]
  );

  return (
    <I18nContext.Provider
      value={{
        lang,
        t,
        setLang,
        withLang: withLangFn,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};

// Hook for language-aware navigation
export const useLangNavigate = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();

  return useCallback(
    (path: string) => {
      navigate(withLang(path, lang));
    },
    [navigate, lang]
  );
};
