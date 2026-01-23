import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Lang = "en" | "id";

const SUPPORTED_LANGS: Lang[] = ["en", "id"];
const DEFAULT_LANG: Lang = "id";

function normalizeLang(input?: string | null): Lang {
  if (!input) return DEFAULT_LANG;
  const clean = input.replace("/", "").toLowerCase();
  return SUPPORTED_LANGS.includes(clean as Lang)
    ? (clean as Lang)
    : DEFAULT_LANG;
}

export function useLanguage() {
  const location = useLocation();
  const navigate = useNavigate();

  const lang = useMemo<Lang>(() => {
    const segment = location.pathname.split("/")[1];
    return normalizeLang(segment);
  }, [location.pathname]);

  const setLanguage = useCallback(
    (nextLang: Lang) => {
      if (nextLang === lang) return;

      const pathWithoutLang = location.pathname
        .replace(/^\/(en|id)(\/|$)/, "/")
        .replace(/\/{2,}/g, "/");

      const nextPath =
        nextLang === DEFAULT_LANG
          ? pathWithoutLang
          : `/${nextLang}${pathWithoutLang}`;

      navigate(nextPath.replace(/\/{2,}/g, "/"), { replace: true });
    },
    [lang, location.pathname, navigate]
  );

  return {
    lang,
    isEN: lang === "en",
    isID: lang === "id",
    setLanguage,
  };
}
