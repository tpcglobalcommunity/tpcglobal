/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "src");
const TARGET_DIRS = [path.join(ROOT, "pages"), path.join(ROOT, "components")];

const BAD_PATTERNS = [
  "../i18n",
  "../../i18n",
  "../../../i18n",
  "../components/",
  "../../components/",
  "../../../components/",
  "../lib/",
  "../../lib/",
  "../../../lib/",
  "../contexts/",
  "../../contexts/",
  "../../../contexts/",
  "../utils/",
  "../../utils/",
  "../../../utils/",
  "../data/",
  "../../data/",
  "../../../data/",
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) out.push(p);
  }
  return out;
}

let bad = 0;

for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    const txt = fs.readFileSync(file, "utf8");
    const lines = txt.split(/\r?\n/);
    lines.forEach((line, idx) => {
      if (!line.includes("from")) return;
      for (const pat of BAD_PATTERNS) {
        if (line.includes(`from "${pat}`) || line.includes(`from '${pat}`)) {
          bad++;
          console.log(`[BAD IMPORT] ${path.relative(process.cwd(), file)}:${idx + 1}`);
          console.log(`  ${line.trim()}`);
          break;
        }
      }
    });
  }
}

if (bad > 0) {
  console.error(`\n❌ Found ${bad} forbidden relative imports. Use @/ alias.`);
  process.exit(1);
} else {
  console.log("✅ audit:imports passed. No forbidden relative imports.");
}
