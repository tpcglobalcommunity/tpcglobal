// src/utils/langPath.ts
export type Language = "en" | "id";

export const LANGS: Language[] = ["en", "id"];
export const STORAGE_KEY = "tpc_lang";

export function isLang(v: any): v is Language {
  return v === "en" || v === "id";
}

export function getStoredLanguage(): Language | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

export function storeLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
}

export function detectLangFromPath(pathname: string): Language | null {
  const m = pathname.match(/^\/(en|id)(\/|$)/);
  return (m?.[1] as Language) ?? null;
}

export function collapseDoubleLang(pathname: string): string {
  let p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // /en/en/... or /id/id/...
  p = p.replace(/^\/(en|id)\/\1(\/|$)/, "/$1$2");
  // edge case: /en//en/...
  p = p.replace(/^\/(en|id)\/+(\1)(\/|$)/, "/$1$3");
  return p;
}

export function stripLangPrefix(pathname: string): string {
  return pathname.replace(/^\/(en|id)(?=\/|$)/, "") || "/";
}

export function ensureLangPath(lang: Language, path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const collapsed = collapseDoubleLang(raw);
  const hasLang = detectLangFromPath(collapsed);
  if (hasLang) return collapsed;

  const without = stripLangPrefix(collapsed);
  const clean = without.startsWith("/") ? without : `/${without}`;
  return `/${lang}${clean === "/" ? "" : clean}`.replace(/\/{2,}/g, "/");
}

export function pickBestLang(pathname: string): Language {
  return detectLangFromPath(pathname) ?? getStoredLanguage() ?? "en";
}

export function switchLangInPath(pathname: string, next: Language): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const stripped = p.replace(/^\/(en|id)(?=\/|$)/, "");
  const tail = stripped.startsWith("/") ? stripped : `/${stripped}`;
  const normalizedTail = tail === "/home" ? "" : tail; // canonical home
  return `/${next}${normalizedTail}`.replace(/\/{2,}/g, "/");
}

export function normalizePathname(pathname: string): {
  pathname: string;
  redirect: boolean;
  lang: Language;
} {
  const original = pathname.startsWith("/") ? pathname : `/${pathname}`;
  let collapsed = collapseDoubleLang(original);

  // canonical home: /en/home -> /en ; /id/home -> /id (also handles trailing slash)
  collapsed = collapsed.replace(/^\/(en|id)\/home\/?$/, "/$1");

  const lang = pickBestLang(collapsed);
  const enforced = detectLangFromPath(collapsed)
    ? collapsed
    : ensureLangPath(lang, collapsed);

  return {
    pathname: enforced,
    redirect: enforced !== original,
    lang,
  };
}
