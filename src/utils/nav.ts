import { Language } from '@/i18n';
import { translations } from '@/i18n/translations';

/**
 * Safe navigation resolver that prevents crashes when accessing nested translation keys
 * Falls back from current language to English if the key doesn't exist
 */
export function getNavSafe(lang: Language | undefined, key: string): string {
  // Ensure lang is a valid Language type
  const safeLang = lang === 'en' || lang === 'id' ? lang : 'en';
  
  // Get the translation dictionary for the current language
  const dict = translations[safeLang];
  
  // Get the English dictionary as fallback
  const enDict = translations.en;
  
  // Try to get the value from current language, fallback to English
  if (dict && typeof dict === 'object' && key in dict) {
    const value = dict[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  
  // Fallback to English
  if (enDict && typeof enDict === 'object' && key in enDict) {
    const value = enDict[key];
    if (typeof value === 'string') {
      return value;
    }
  }
  
  // Ultimate fallback - return the key itself
  return key;
}

/**
 * Safe navigation items resolver that returns an array with fallback
 */
export function getNavItemsSafe(lang: Language | undefined): any[] {
  const safeLang = lang === 'en' || lang === 'id' ? lang : 'en';
  
  // Get the translation dictionary for the current language
  const dict = translations[safeLang];
  
  // Get the English dictionary as fallback
  const enDict = translations.en;
  
  // Try to get nav items from current language
  if (dict && typeof dict === 'object' && 'nav' in dict) {
    const nav = dict.nav;
    if (Array.isArray(nav)) {
      return nav;
    }
  }
  
  // Fallback to English
  if (enDict && typeof enDict === 'object' && 'nav' in enDict) {
    const nav = enDict.nav;
    if (Array.isArray(nav)) {
      return nav;
    }
  }
  
  // Ultimate fallback - return empty array
  return [];
}

/**
 * Safe translation wrapper that prevents crashes
 */
export function tSafe(key: string, lang: Language | undefined): string {
  return getNavSafe(lang, key);
}
