import { PRIMARY_SITE_URL } from '../config/site';

export type Language = 'id' | 'en';

export function normalizeLang(lang: string): Language {
  return (lang === 'en' ? 'en' : 'id') as Language;
}

export function withLang(path: string, lang: Language): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${cleanPath}`;
}

export function getLangFromPath(path: string): Language {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  return normalizeLang(firstSegment);
}

export function removeLangFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (firstSegment === 'id' || firstSegment === 'en') {
    return '/' + segments.slice(1).join('/');
  }
  return path;
}

export function createLocalizedUrl(path: string, lang: Language): string {
  return `${PRIMARY_SITE_URL}${withLang(path, lang)}`;
}
