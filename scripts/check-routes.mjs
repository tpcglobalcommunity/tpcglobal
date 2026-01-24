import http from "http";
import https from "https";
import { URL } from "url";

const DEFAULT_ROUTES = [
  "/id",
  "/en",
  "/id/docs",
  "/en/docs",
  "/id/dao",
  "/en/dao",
  "/id/transparency",
  "/en/transparency",
];

// ===== CONFIG (via env) =====
// BASE_URL: ex http://localhost:5174  OR https://tpcglobal.io
// ROUTES:   comma separated override, ex "/id/docs,/en/docs"
// FAIL_ON_TEXT: comma separated strings that must NOT appear in HTML
const BASE_URL = process.env.BASE_URL || "http://localhost:5174";
const ROUTES = (process.env.ROUTES?.split(",").map(s => s.trim()).filter(Boolean) || DEFAULT_ROUTES);

const FAIL_ON_TEXT = (process.env.FAIL_ON_TEXT?.split(",").map(s => s.trim()).filter(Boolean) || [
  "i18n missing",
  "[i18n missing]",
  "Missing translation",
]);

const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 8000);

// Allow 200 and common redirects (301/302/307/308)
function isOkStatus(code) {
  return code === 200 || code === 301 || code === 302 || code === 307 || code === 308;
}

function requestUrl(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;

    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method: "GET",
        headers: {
          "User-Agent": "tpc-check-routes/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            url,
            status: res.statusCode ?? 0,
            location: res.headers.location,
            body: data,
          });
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });
    req.end();
  });
}

function joinUrl(base, path) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function shorten(s, n = 220) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, n);
}

function findFailText(body) {
  const lower = body.toLowerCase();
  for (const t of FAIL_ON_TEXT) {
    if (!t) continue;
    if (lower.includes(t.toLowerCase())) return t;
  }
  return null;
}

(async () => {
  console.log("\n🔍 TPC ROUTE CHECK (CI-grade)");
  console.log("BASE_URL:", BASE_URL);
  console.log("ROUTES  :", ROUTES.join(", "));
  console.log("TIMEOUT :", `${TIMEOUT_MS}ms`);
  console.log("FAIL_ON :", FAIL_ON_TEXT.join(" | "), "\n");

  let failed = 0;

  for (const r of ROUTES) {
    const url = joinUrl(BASE_URL, r);

    try {
      const res = await requestUrl(url);
      const ok = isOkStatus(res.status);

      const isEmpty = res.status === 200 && (!res.body || res.body.trim().length < 50);
      const badText = res.status === 200 ? findFailText(res.body) : null;

      const statusLine = ok ? "✅" : "❌";

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`${statusLine} ${url}`);
      console.log("STATUS    :", res.status);

      if (res.location) console.log("REDIRECT  :", res.location);
      if (res.status === 200) console.log("PREVIEW   :", shorten(res.body));

      if (!ok) {
        failed++;
        console.log("REASON    :", "Bad status (expected 200 or redirect)");
      } else if (isEmpty) {
        failed++;
        console.log("REASON    :", "Empty/too short HTML response");
      } else if (badText) {
        failed++;
        console.log("REASON    :", `Forbidden text detected: "${badText}"`);
      }
    } catch (err) {
      failed++;
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`❌ ${url}`);
      console.log("ERROR     :", err?.message || String(err));
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (failed > 0) {
    console.log(`❌ FAILED: ${failed} route(s)`);
    process.exit(1);
  } else {
    console.log("✅ ALL ROUTES PASSED");
    process.exit(0);
  }
})();
