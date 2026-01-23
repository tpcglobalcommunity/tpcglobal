export type Language = "en" | "id";

export function stripLang(pathname: string): string {
  const p = pathname || "/";
  const stripped = p.replace(/^\/(en|id)(?=\/|$)/, "");
  return stripped === "" ? "/" : stripped;
}

export function ensureLangPath(lang: Language, pathname: string): string {
  const bare = stripLang(pathname);
  const normalized = bare.startsWith("/") ? bare : `/${bare}`;
  // prevent accidental double slashes
  const clean = normalized.replace(/\/{2,}/g, "/");
  return `/${lang}${clean}`.replace(/\/{2,}/g, "/");
}

export function getLanguageFromPath(pathname: string): Language {
  const m = (pathname || "/").match(/^\/(en|id)(\/|$)/);
  return (m?.[1] as Language) || "en";
}

// Legacy function for backward compatibility
export function langPath(lang: string, path: string): string {
  return ensureLangPath(lang as Language, path);
}
