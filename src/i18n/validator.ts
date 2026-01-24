import { translations } from "./translations";

// flatten keys including array indices
function flatten(obj: any, prefix = "", out = new Set<string>()) {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      flatten(obj[k], next, out);
    }
    return out;
  }
  if (prefix) out.add(prefix);
  return out;
}

export function validateTranslations() {
  const enKeys = flatten(translations.en);
  const idKeys = flatten(translations.id);

  const missingInId = [...enKeys].filter(k => !idKeys.has(k));
  const missingInEn = [...idKeys].filter(k => !enKeys.has(k));

  return { missingInId, missingInEn, enCount: enKeys.size, idCount: idKeys.size };
}

// Development validator - run this in dev console
export function runDevValidation() {
  const result = validateTranslations();
  
  console.group("🔍 I18n Translation Validation");
  console.log(`📊 EN Keys: ${result.enCount}, ID Keys: ${result.idCount}`);
  
  if (result.missingInId.length > 0) {
    console.warn("❌ Missing in Indonesian:", result.missingInId);
  }
  
  if (result.missingInEn.length > 0) {
    console.warn("❌ Missing in English:", result.missingInEn);
  }
  
  if (result.missingInId.length === 0 && result.missingInEn.length === 0) {
    console.log("✅ All translations are in sync!");
  }
  
  console.groupEnd();
  
  return result;
}

// Auto-run in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Expose to global for manual testing
  (window as any).__validateI18n = runDevValidation;
  
  // Run validation automatically
  setTimeout(() => {
    runDevValidation();
  }, 1000);
}
