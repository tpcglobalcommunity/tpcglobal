import http from "http";
import https from "https";
import { URL } from "url";

const DEFAULT_ROUTES = [
  "/",
  "/en",
  "/id",
  "/id/docs",
  "/id/dao",
  "/en/docs",
  "/en/dao",
];

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 12000);

const FAIL_TEXTS = [
  "i18n missing",
  "[i18n missing]",
  "Missing translation",
  "ErrorBoundary",
  "Something went wrong",
];

function checkRoute(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;

    const req = lib.get(u, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          url,
          status: res.statusCode,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });
  });
}

(async () => {
  console.log(`🔍 CHECKING ROUTES: ${BASE_URL}`);
  console.log(`⏱️  TIMEOUT: ${TIMEOUT_MS}ms`);
  console.log("");

  let failed = 0;

  for (const route of DEFAULT_ROUTES) {
    const fullUrl = `${BASE_URL}${route}`;

    try {
      const result = await checkRoute(fullUrl);
      
      if (result.status >= 400) {
        console.log(`❌ FAIL ${fullUrl} ${result.status}`);
        failed++;
        continue;
      }

      const bodyLower = result.body.toLowerCase();
      const foundFailText = FAIL_TEXTS.find(text => 
        bodyLower.includes(text.toLowerCase())
      );

      if (foundFailText) {
        console.log(`❌ FAIL ${fullUrl} "${foundFailText}"`);
        failed++;
        continue;
      }

      console.log(`✅ OK ${fullUrl}`);
      
    } catch (err) {
      console.log(`❌ FAIL ${fullUrl} ${err.message}`);
      failed++;
    }
  }

  console.log("");
  if (failed > 0) {
    console.log(`❌ FAILED: ${failed} route(s)`);
    process.exit(1);
  } else {
    console.log("✅ ALL ROUTES PASSED");
    process.exit(0);
  }
})();
