import http from "http";
import https from "https";
import { URL } from "url";

const DEFAULT_ROUTES = [
  "/",
  "/en",
  "/id",
  "/en/signup",
  "/id/signup",
  "/en/login", 
  "/id/login",
  "/en/forgot",
  "/id/forgot",
  "/en/verify",
  "/id/verify",
  "/en/invite",
  "/id/invite",
  "/en/magic",
  "/id/magic",
  "/en/maintenance",
  "/id/maintenance",
  "/en/marketplace",
  "/id/marketplace",
  "/en/marketplace/item/demo",
  "/id/marketplace/item/demo",
  "/en/docs",
  "/id/docs",
  "/en/dao",
  "/id/dao",
  "/en/member/update-profit",
  "/id/member/update-profit",
];

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 12000);

// Determine if we're in production mode
const isProd = (BASE_URL.startsWith("https://") && !BASE_URL.includes("localhost")) || 
               process.env.CI === "true";

const FAIL_TEXTS = [
  "errorboundary",
  "something went wrong",
  "application error",
  "i18n missing",
  "[i18n missing]",
  "missing translation",
  "hydration failed",
  "failed to load resource",
  "chunkloaderror",
  "loading chunk",
  "net::err",
  "module script failed",
  "service worker",
];

function detectBlankPage(body) {
  // Check for empty root div
  const emptyRootMatch = body.match(/<div[^>]*id=["']root["'][^>]*>\s*<\/div>/i);
  if (emptyRootMatch) {
    // Check if there's meaningful content after root
    const hasContent = /<(main|header|section|h1|nav|article|aside|footer)/i.test(body) ||
                       /data-reactroot/i.test(body) ||
                       /__REACT_DEVTOOLS_GLOBAL_HOOK__/i.test(body) ||
                       /class="[^"]*\w+[^"]*"/i.test(body) || // Any class with content
                       /vite-dev/i.test(body) || // Vite dev mode indicator
                       /type="module"/i.test(body); // Module scripts indicate JS loading
    
    if (!hasContent) {
      if (isProd) {
        return "blank root (possible JS/hydration failure)";
      } else {
        return "WARN blank root (dev mode allowed)";
      }
    }
  }
  return null;
}

function detectMissingAssets(body) {
  // Only check for missing assets in production mode
  if (!isProd) {
    return null; // Skip check for development mode
  }
  
  const hasScripts = /<script/i.test(body);
  
  // More flexible asset detection
  const hasAssets = /src=["'][^"']*\/assets\//i.test(body) ||                    // /assets/
                      /src=["'][^"']*\/@vite\//i.test(body) ||                     // /@vite/ (preview/dev)
                      /src=["'][^"']*\.js["'][^>]*>/i.test(body);                  // any .js files
  
  if (hasScripts && !hasAssets) {
    return "no assets scripts found";
  }
  return null;
}

function logMissingAssetsDiagnostics(result) {
  if (!isProd) return; // Only in production mode
  
  console.log(`    🔍 DIAGNOSTICS:`);
  console.log(`       FINAL_URL: ${result.finalUrl}`);
  console.log(`       CONTENT-TYPE: ${result.contentType}`);
  
  // Extract script sources
  const scriptMatches = result.body.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  if (scriptMatches.length > 0) {
    console.log(`       SCRIPTS FOUND (${scriptMatches.length}):`);
    scriptMatches.slice(0, 10).forEach((script, i) => {
      const srcMatch = script.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        console.log(`         ${i + 1}. ${srcMatch[1]}`);
      }
    });
    if (scriptMatches.length > 10) {
      console.log(`         ... and ${scriptMatches.length - 10} more`);
    }
  } else {
    console.log(`       SCRIPTS FOUND: 0`);
  }
  
  // Body preview
  const bodyPreview = result.body.replace(/\s+/g, ' ').trim().slice(0, 200);
  console.log(`       BODY PREVIEW: ${bodyPreview}${result.body.length > 200 ? '...' : ''}`);
}

function detectServiceWorkerError(body) {
  const lowerBody = body.toLowerCase();
  if (lowerBody.includes('service worker') && lowerBody.includes('error')) {
    if (isProd) {
      return "service worker error";
    } else {
      return "WARN service worker error (dev mode allowed)";
    }
  }
  return null;
}

async function checkRoute(url, maxRedirects = 5) {
  let currentUrl = url;
  let redirectCount = 0;
  const startTime = Date.now();

  while (redirectCount <= maxRedirects) {
    try {
      const result = await fetchSingle(currentUrl);
      const responseTime = Date.now() - startTime;

      if (result.status >= 300 && result.status < 400 && result.location) {
        redirectCount++;
        currentUrl = new URL(result.location, currentUrl).href;
        continue;
      }

      return {
        url,
        finalUrl: currentUrl,
        status: result.status,
        body: result.body,
        redirectCount,
        responseTime,
        contentType: result.contentType,
      };
    } catch (err) {
      return {
        url,
        finalUrl: currentUrl,
        status: 0,
        body: "",
        redirectCount,
        responseTime: Date.now() - startTime,
        error: err.message,
        contentType: "",
      };
    }
  }

  return {
    url,
    finalUrl: currentUrl,
    status: 0,
    body: "",
    redirectCount,
    responseTime: Date.now() - startTime,
    error: "Too many redirects",
  };
}

function fetchSingle(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;

    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "tpc-route-check/1.0",
        "Accept": "text/html",
      },
    };

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          location: res.headers.location,
          body: data,
          contentType: res.headers["content-type"] || "",
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });
    req.end();
  });
}

(async () => {
  console.log(`🔍 CHECKING ROUTES: ${BASE_URL}`);
  console.log(`⏱️  TIMEOUT: ${TIMEOUT_MS}ms`);
  console.log(`📋 ROUTES: ${DEFAULT_ROUTES.length} routes`);
  console.log(`🏷️  MODE: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log("");

  let passed = 0;
  let failed = 0;
  const failedRoutes = [];

  for (const route of DEFAULT_ROUTES) {
    const fullUrl = `${BASE_URL}${route}`;
    const result = await checkRoute(fullUrl);

    const statusOk = result.status >= 200 && result.status < 400;
    const bodyLower = result.body.toLowerCase();
    
    // Check for various failure patterns
    const foundFailText = FAIL_TEXTS.find(text => 
      bodyLower.includes(text.toLowerCase())
    );
    
    const blankPageError = detectBlankPage(result.body);
    const missingAssetsError = detectMissingAssets(result.body);
    const serviceWorkerError = detectServiceWorkerError(result.body);

    // Determine if this is a failure or warning
    const hasWarnings = blankPageError?.startsWith('WARN') || 
                       serviceWorkerError?.startsWith('WARN');
    const hasFailures = !statusOk || foundFailText || result.error || 
                       (blankPageError && !blankPageError.startsWith('WARN')) ||
                       (missingAssetsError && !missingAssetsError.startsWith('WARN')) ||
                       (serviceWorkerError && !serviceWorkerError.startsWith('WARN'));

    if (!hasFailures) {
      passed++;
      const redirectInfo = result.redirectCount > 0 ? ` → ${result.redirectCount} redirects` : "";
      console.log(`✅ PASS ${fullUrl} [${result.status}]${redirectInfo} (${result.responseTime}ms)`);
      
      // Show warnings if any
      if (hasWarnings) {
        if (blankPageError?.startsWith('WARN')) {
          console.log(`    ⚠️ WARN: ${blankPageError}`);
        }
        if (serviceWorkerError?.startsWith('WARN')) {
          console.log(`    ⚠️ WARN: ${serviceWorkerError}`);
        }
      }
    } else {
      failed++;
      failedRoutes.push(fullUrl);
      const redirectInfo = result.redirectCount > 0 ? ` → ${result.redirectCount} redirects` : "";
      console.log(`❌ FAIL (prod) ${fullUrl} [${result.status}]${redirectInfo} (${result.responseTime}ms)`);
      
      if (result.error) {
        console.log(`    ERROR: ${result.error}`);
      } else if (!statusOk) {
        console.log(`    REASON: HTTP ${result.status} (expected 200-399)`);
      } else if (foundFailText) {
        console.log(`    REASON: Found error text "${foundFailText}"`);
      } else if (blankPageError) {
        console.log(`    REASON: ${blankPageError}`);
      } else if (missingAssetsError) {
        console.log(`    REASON: ${missingAssetsError}`);
        logMissingAssetsDiagnostics(result);
      } else if (serviceWorkerError) {
        console.log(`    REASON: ${serviceWorkerError}`);
      }
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log(`📊 SUMMARY: ${DEFAULT_ROUTES.length} total, ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log("");
    console.log("❌ FAILED ROUTES:");
    failedRoutes.forEach(route => console.log(`   ${route}`));
    console.log("");
    console.log(`❌ CI FAILED: ${failed} route(s) failed validation`);
    process.exit(1);
  } else {
    console.log("✅ ALL ROUTES PASSED");
    process.exit(0);
  }
})();
