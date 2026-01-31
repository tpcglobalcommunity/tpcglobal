import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { copy } from "./copy";
import { Lang, extractLang, withLang } from "./lang";

// Get nested value from object by dot notation
const getNestedValue = (obj: Record<string, unknown>, path: string): string | string[] => {
  const keys = path.split(".");
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      // Return key if not found (no console.info during render)
      return path;
    }
  }
  
  // Ensure we return a string, not an object or other type
  if (typeof current === 'string') {
    return current;
  } else if (Array.isArray(current)) {
    return current.join(', ');
  } else {
    return String(current || path);
  }
};

interface I18nContextValue {
  lang: Lang;
  t: (key: string) => string | string[];
  setLang: (lang: Lang) => void;
  withLang: (path: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLangState] = useState<Lang>('id'); // Default to 'id', will be updated in useEffect
  const [currentPath, setCurrentPath] = useState<string>('');

  // Sync lang with URL - use ref to prevent infinite loops
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    const { lang: extractedLang, path: extractedPath } = extractLang(location.pathname);
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setLangState(extractedLang); // Set initial lang from URL
      setCurrentPath(extractedPath); // Set initial path
      return;
    }
    
    const { lang: urlLang, path: urlPath } = extractLang(location.pathname);
    if (urlLang !== lang) {
      setLangState(urlLang);
    }
    if (urlPath !== currentPath) {
      setCurrentPath(urlPath);
    }
  }, [location.pathname, lang, currentPath]);

  const setLang = useCallback(
    (newLang: Lang) => {
      if (newLang !== lang) {
        setLangState(newLang);
      }
    },
    [lang]
  );

  // Handle navigation when lang changes (pure effect, no callbacks)
  useEffect(() => {
    if (currentPath && currentPath !== '' && !isInitialMount.current) {
      navigate(withLang(currentPath, lang), { replace: true });
    }
  }, [lang, currentPath, navigate]);

  const t = useCallback(
    (key: string): string | string[] => {
      try {
        const result = getNestedValue(copy[lang] as unknown as Record<string, unknown>, key);
        return result;
      } catch (error) {
        // Log error in development but don't throw during render
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key not found: ${key}`, error);
        }
        return key; // Fallback to key name
      }
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
