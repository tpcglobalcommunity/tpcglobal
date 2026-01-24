// src/utils/langPath.ts (REPLACE ALL - FINAL LOCKED)

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

// -------------------------
// Core normalization
// -------------------------
function ensureLeadingSlash(p: string): string {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function collapseSlashes(p: string): string {
  return p.replace(/\/{2,}/g, "/");
}

export function detectLangFromPath(pathname: string): Language | null {
  const p = ensureLeadingSlash(pathname);
  const m = p.match(/^\/(en|id)(\/|$)/);
  return (m?.[1] as Language) ?? null;
}

/**
 * Collapses double-lang prefixes repeatedly:
 * - /en/en/x -> /en/x
 * - /en/en/en/x -> /en/x
 * - /en//en//x -> /en/x
 */
export function collapseDoubleLang(pathname: string): string {
  let p = collapseSlashes(ensureLeadingSlash(pathname));

  // repeat until stable
  while (true) {
    const next = p
      .replace(/^\/(en|id)\/\1(\/|$)/, "/$1$2")     // /en/en -> /en
      .replace(/^\/(en|id)\/+(\1)(\/|$)/, "/$1$3"); // /en//en -> /en
    if (next === p) break;
    p = collapseSlashes(next);
  }

  return p;
}

export function stripLangPrefix(pathname: string): string {
  const p = ensureLeadingSlash(pathname);
  const out = p.replace(/^\/(en|id)(?=\/|$)/, "");
  return out === "" ? "/" : out;
}

export function ensureLangPath(lang: Language, path: string): string {
  const raw = ensureLeadingSlash(path);
  const collapsed = collapseDoubleLang(raw);
  const hasLang = detectLangFromPath(collapsed);
  if (hasLang) return collapseSlashes(collapsed);

  const without = stripLangPrefix(collapsed);
  const clean = ensureLeadingSlash(without);
  const out = `/${lang}${clean === "/" ? "" : clean}`;
  return collapseSlashes(collapseDoubleLang(out));
}

export function pickBestLang(pathname: string): Language {
  const p = ensureLeadingSlash(pathname);
  return detectLangFromPath(p) ?? getStoredLanguage() ?? "en";
}

export function switchLangInPath(pathname: string, next: Language): string {
  const p = collapseDoubleLang(collapseSlashes(ensureLeadingSlash(pathname)));

  // strip current prefix (if any)
  const stripped = stripLangPrefix(p);
  const tail = ensureLeadingSlash(stripped);

  // canonical home: "/home" becomes ""
  const normalizedTail = tail === "/home" ? "" : tail;

  return collapseSlashes(`/${next}${normalizedTail === "/" ? "" : normalizedTail}`);
}

// -------------------------
// Public normalizer for Router
// -------------------------
export function normalizePathname(pathname: string): {
  pathname: string;
  redirect: boolean;
  lang: Language;
} {
  const original = ensureLeadingSlash(pathname);

  // Normalize original FIRST (so redirect compare is fair)
  let normalizedOriginal = collapseDoubleLang(collapseSlashes(original));

  // remove trailing slash (except root)
  if (normalizedOriginal.length > 1) {
    normalizedOriginal = normalizedOriginal.replace(/\/+$/, "");
  }

  // canonical home:
  // /en/home -> /en
  // /id/home -> /id
  normalizedOriginal = normalizedOriginal.replace(/^\/(en|id)\/home\/?$/, "/$1");

  const lang = pickBestLang(normalizedOriginal);

  // enforce prefix if missing + final cleanup
  let enforced = detectLangFromPath(normalizedOriginal)
    ? normalizedOriginal
    : ensureLangPath(lang, normalizedOriginal);

  enforced = collapseDoubleLang(collapseSlashes(enforced));
  if (enforced.length > 1) enforced = enforced.replace(/\/+$/, "");
  enforced = enforced.replace(/^\/(en|id)\/home\/?$/, "/$1");

  return {
    pathname: enforced,
    redirect: enforced !== normalizedOriginal,
    lang,
  };
}
