import { translations } from "../src/i18n/translations";

type Leaf = { key: string; value: any };

function flattenLeaves(obj: any, prefix = "", out: Leaf[] = []): Leaf[] {
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenLeaves(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      flattenLeaves(obj[k], next, out);
    }
    return out;
  }
  if (prefix) out.push({ key: prefix, value: obj });
  return out;
}

function keySet(leaves: Leaf[]) {
  return new Set(leaves.map(l => l.key));
}

function looksLikeKey(s: string): boolean {
  if (!s.includes(".")) return false;
  if (!/^[A-Za-z0-9_.\[\]-]+$/.test(s)) return false;
  if (!/^[A-Za-z]/.test(s)) return false;
  if (s.startsWith("http://") || s.startsWith("https://")) return false;
  // avoid sentences with dots (like "Loading...") - require no spaces
  if (/\s/.test(s)) return false;
  // avoid common patterns that look like keys but aren't
  if (s.endsWith("...") || s.endsWith("…")) return false;
  return true;
}

function isEllipsisLike(s: string): boolean {
  const t = s.trim();
  if (t === "…" || t === "..." || t === "..") return true;
  if (/^[.\u2026]{2,}$/.test(t)) return true;
  return false;
}

function containsPlaceholderWord(s: string): boolean {
  return /\b(TODO|TBA|WIP)\b/i.test(s);
}

// Enterprise policy helpers
function hasDoubleSpace(s: string) {
  return / {2,}/.test(s);
}
function hasTab(s: string) {
  return /\t/.test(s);
}
function hasRawAngles(s: string) {
  return /[<>]/.test(s);
}
function endsWithPunct(s: string) {
  return /[.,;:!?]$/.test(s.trim());
}
function isCapitalized(s: string) {
  const t = s.trim();
  if (!t) return true;
  const first = t[0];
  return first === first.toUpperCase();
}

// Key-based max lengths (rule F)
function maxLenForKey(key: string): number | null {
  if (/\bcta$/.test(key)) return 24;
  if (/^nav\./.test(key)) return 16;
  if (/\bbadge$/.test(key)) return 42;
  if (/\btitle$/.test(key)) return 52;
  if (/\bsubtitle$/.test(key)) return 120;
  if (/\bdesc$/.test(key)) return 160;
  return null;
}

// Profanity blocklist (rule J) — minimal enterprise gate
const BLOCKED = [
  // EN common profanity
  "fuck","fucking","shit","bitch","cunt","asshole","motherfucker",
  // ID common profanity (minimal)
  "anjing","bangsat","kontol","memek","ngentot","bajingan","tolol",
];

function containsBlockedWord(s: string): string | null {
  const lower = s.toLowerCase();
  for (const w of BLOCKED) {
    // word boundary-ish (avoid matching inside normal words too much)
    const re = new RegExp(`(^|[^a-zA-Z0-9])${w}([^a-zA-Z0-9]|$)`, "i");
    if (re.test(lower)) return w;
  }
  return null;
}

function main() {
  const enLeaves = flattenLeaves(translations.en);
  const idLeaves = flattenLeaves(translations.id);

  const enKeys = keySet(enLeaves);
  const idKeys = keySet(idLeaves);

  const missingInId = [...enKeys].filter(k => !idKeys.has(k)).sort();
  const missingInEn = [...idKeys].filter(k => !enKeys.has(k)).sort();

  const enCount = enKeys.size;
  const idCount = idKeys.size;

  const errors: string[] = [];
  const warnings: string[] = [];

  // (A) mismatch
  if (missingInId.length || missingInEn.length) {
    errors.push("❌ (A) Key mismatch between EN and ID");
    errors.push(`EN keys: ${enCount} | ID keys: ${idCount}`);
    if (missingInId.length) {
      errors.push(`Missing in ID (${missingInId.length}):`);
      missingInId.forEach(k => errors.push(` - ${k}`));
    }
    if (missingInEn.length) {
      errors.push(`Missing in EN (${missingInEn.length}):`);
      missingInEn.forEach(k => errors.push(` - ${k}`));
    }
  }

  // maps
  const enMap = new Map(enLeaves.map(l => [l.key, l.value]));
  const idMap = new Map(idLeaves.map(l => [l.key, l.value]));

  const badEmpty: string[] = [];
  const badEllipsis: string[] = [];
  const badLooksKey: string[] = [];
  const badPlaceholder: string[] = [];

  // enterprise
  const badMaxLen: string[] = [];
  const badSpacing: string[] = [];
  const badPunct: string[] = [];
  const badAngles: string[] = [];
  const badProfanity: string[] = [];
  const warnCaps: string[] = [];

  const allKeys = new Set([...enKeys, ...idKeys]);

  for (const k of allKeys) {
    if (!enMap.has(k) || !idMap.has(k)) continue; // mismatch already handled

    for (const [side, v] of [["EN", enMap.get(k)], ["ID", idMap.get(k)]] as const) {
      if (v === null || v === undefined) {
        badEmpty.push(`${side}:${k} = ${String(v)}`);
        continue;
      }

      if (typeof v === "string") {
        // (G) whitespace rules
        if (v !== v.trim()) badSpacing.push(`${side}:${k} = has leading/trailing spaces`);
        if (hasDoubleSpace(v)) badSpacing.push(`${side}:${k} = has double spaces`);
        if (hasTab(v)) badSpacing.push(`${side}:${k} = has tab`);

        // (I) raw angles
        if (hasRawAngles(v)) badAngles.push(`${side}:${k} = contains < or >`);

        // (J) profanity
        const blocked = containsBlockedWord(v);
        if (blocked) badProfanity.push(`${side}:${k} = contains "${blocked}"`);

        // (B) empty string
        if (!v.trim()) badEmpty.push(`${side}:${k} = (empty string)`);

        // (C) ellipsis placeholder
        if (isEllipsisLike(v)) badEllipsis.push(`${side}:${k} = "${v}"`);

        // (D) looks like key leak
        if (looksLikeKey(v.trim())) badLooksKey.push(`${side}:${k} = "${v}"`);

        // (E) TODO/TBA/WIP
        if (containsPlaceholderWord(v)) badPlaceholder.push(`${side}:${k} = "${v}"`);

        // (F) max length per key pattern
        const maxLen = maxLenForKey(k);
        if (maxLen !== null && v.trim().length > maxLen) {
          badMaxLen.push(`${side}:${k} length=${v.trim().length} max=${maxLen} value="${v.trim()}"`);
        }

        // (H) trailing punctuation for key types (more specific)
        const needsNoPunct = /\b(cta|badge)$/.test(k) || /^nav\./.test(k);
        if (needsNoPunct && endsWithPunct(v)) {
          badPunct.push(`${side}:${k} = ends with punctuation value="${v.trim()}"`);
        }

        // (K) soft warn capitalization for nav/cta
        const capWarn = /^nav\./.test(k) || /\bcta$/.test(k);
        if (capWarn && !isCapitalized(v)) {
          warnCaps.push(`${side}:${k} value="${v.trim()}"`);
        }
      }
    }
  }

  // Collect HARD errors
  if (badEmpty.length) {
    errors.push("\n❌ (B) Empty/undefined translation values detected:");
    badEmpty.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badEmpty.length > 200) errors.push(` ...and ${badEmpty.length - 200} more`);
  }

  if (badEllipsis.length) {
    errors.push("\n❌ (C) Ellipsis/dots placeholder values detected:");
    badEllipsis.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badEllipsis.length > 200) errors.push(` ...and ${badEllipsis.length - 200} more`);
  }

  if (badLooksKey.length) {
    errors.push("\n❌ (D) Translation values that look like keys detected (KEY LEAK):");
    badLooksKey.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badLooksKey.length > 200) errors.push(` ...and ${badLooksKey.length - 200} more`);
  }

  if (badPlaceholder.length) {
    errors.push("\n❌ (E) Placeholder words (TODO/TBA/WIP) detected:");
    badPlaceholder.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badPlaceholder.length > 200) errors.push(` ...and ${badPlaceholder.length - 200} more`);
  }

  if (badMaxLen.length) {
    errors.push("\n❌ (F) Max-length violations detected:");
    badMaxLen.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badMaxLen.length > 200) errors.push(` ...and ${badMaxLen.length - 200} more`);
  }

  if (badSpacing.length) {
    errors.push("\n❌ (G) Whitespace violations (double spaces/tabs/trim) detected:");
    badSpacing.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badSpacing.length > 200) errors.push(` ...and ${badSpacing.length - 200} more`);
  }

  if (badPunct.length) {
    errors.push("\n❌ (H) Trailing punctuation not allowed for nav/cta/badge:");
    badPunct.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badPunct.length > 200) errors.push(` ...and ${badPunct.length - 200} more`);
  }

  if (badAngles.length) {
    errors.push("\n❌ (I) Raw angle brackets < > not allowed:");
    badAngles.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badAngles.length > 200) errors.push(` ...and ${badAngles.length - 200} more`);
  }

  if (badProfanity.length) {
    errors.push("\n❌ (J) Blocked words detected (profanity gate):");
    badProfanity.slice(0, 200).forEach(x => errors.push(` - ${x}`));
    if (badProfanity.length > 200) errors.push(` ...and ${badProfanity.length - 200} more`);
  }

  // Soft warnings (K)
  if (warnCaps.length) {
    warnings.push("\n⚠️ (K) Soft warn: nav/cta should be Capitalized:");
    warnCaps.slice(0, 200).forEach(x => warnings.push(` - ${x}`));
    if (warnCaps.length > 200) warnings.push(` ...and ${warnCaps.length - 200} more`);
  }

  if (warnings.length) {
    console.warn("========================================");
    console.warn("ENTERPRISE i18n WARNINGS (non-fatal)");
    console.warn("========================================");
    console.warn(warnings.join("\n"));
  }

  if (errors.length) {
    console.error("========================================");
    console.error("ENTERPRISE i18n VALIDATION FAILED");
    console.error("========================================");
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(`✅ ENTERPRISE i18n validation OK (EN keys: ${enCount}, ID keys: ${idCount})`);
}

main();
