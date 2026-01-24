import http from "http";
import https from "https";
import { URL } from "url";

const routes = [
  "http://localhost:5174/id/docs",
  "http://localhost:5174/en/docs",
  "http://localhost:5174/id/dao",
  "http://localhost:5174/en/dao",
];

function fetchRoute(url) {
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
          preview: data.slice(0, 300).replace(/\s+/g, " "),
        });
      });
    });

    req.on("error", reject);
  });
}

(async () => {
  console.log("\n🔍 CHECKING ROUTES...\n");

  for (const route of routes) {
    try {
      const result = await fetchRoute(route);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("URL    :", result.url);
      console.log("STATUS :", result.status);
      console.log("PREVIEW:", result.preview || "[empty]");
    } catch (err) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("URL    :", route);
      console.log("ERROR  :", err.message);
    }
  }

  console.log("\n✅ ROUTE CHECK FINISHED\n");
})();
