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
