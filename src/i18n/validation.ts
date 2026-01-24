import { validateTranslations } from "./validateTranslations";

if (import.meta.env.DEV) {
  const r = validateTranslations();
  if (r.missingInId.length || r.missingInEn.length) {
    console.warn("[i18n parity] EN keys:", r.enCount, "ID keys:", r.idCount);
    if (r.missingInId.length) console.warn("[i18n missing in ID]", r.missingInId);
    if (r.missingInEn.length) console.warn("[i18n missing in EN]", r.missingInEn);
  } else {
    console.log("[i18n parity] OK", r.enCount, "keys");
  }
}
