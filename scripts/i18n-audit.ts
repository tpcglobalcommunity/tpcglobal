import fs from "node:fs";
import path from "node:path";

// Adjust if your translations are located elsewhere
import { translations } from "../src/i18n/translations";

type Dict = Record<string, any>;

function walk(dir: string, out: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip build artifacts / deps
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".git") continue;
      walk(p, out);
    } else {
      if (!/\.(ts|tsx)$/.test(e.name)) continue;
      out.push(p);
    }
  }
  return out;
}

function extractKeys(code: string): string[] {
  // matches: t("a.b.c") or t('a.b.c')
  const re = /\bt\s*\(\s*(['"])([^'"]+)\1\s*[\),]/g;
  const keys: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const key = m[2].trim();
    if (!key) continue;
    // ignore dynamic keys like `foo.${bar}` 
    if (key.includes("${")) continue;
    keys.push(key);
  }
  return keys;
}

function hasKey(dict: Dict, key: string): boolean {
  const parts = key.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object" || !(p in cur)) return false;
    cur = cur[p];
  }
  return true;
}

function main() {
  const root = path.resolve(process.cwd(), "src");
  const files = walk(root);

  const used = new Set<string>();
  for (const f of files) {
    const code = fs.readFileSync(f, "utf8");
    for (const k of extractKeys(code)) used.add(k);
  }

  const usedKeys = Array.from(used).sort();

  const en = translations.en as Dict;
  const id = translations.id as Dict;

  const missingEn = usedKeys.filter((k) => !hasKey(en, k));
  const missingId = usedKeys.filter((k) => !hasKey(id, k));

  console.log("=======================================");
  console.log("TPC i18n AUDIT REPORT");
  console.log("=======================================");
  console.log("Used keys:", usedKeys.length);
  console.log("---------------------------------------");
  console.log("Missing in EN:", missingEn.length);
  for (const k of missingEn) console.log("  -", k);
  console.log("---------------------------------------");
  console.log("Missing in ID:", missingId.length);
  for (const k of missingId) console.log("  -", k);
  console.log("=======================================");

  // Always exit 0 (report only)
  process.exit(0);
}

main();
