/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const SRC = path.join(process.cwd(), "src");

// Map folder root src yang kita izinkan jadi alias
const ROOTS = ["i18n", "components", "lib", "data", "contexts", "utils"];

// regex: from '../..../(i18n|components|lib|data|contexts|utils)(/something)?'
const re = /from\s+(['"])(\.\.\/)+((?:i18n|components|lib|data|contexts|utils)(?:\/[^'"]*)?)\1/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) out.push(p);
  }
  return out;
}

let changedFiles = 0;
let changedImports = 0;

for (const file of walk(SRC)) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  after = after.replace(re, (m, quote, ups, rest) => {
    // rest starts with allowed root, convert to @/rest
    changedImports++;
    return `from ${quote}@/${rest}${quote}`;
  });

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles++;
    console.log(`✅ fixed: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`\nDONE: ${changedFiles} files updated, ${changedImports} imports converted to @/.`);
