const CF_API = "https://api.cloudflare.com/client/v4";

function must(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

const token = must("CF_API_TOKEN");       // GitHub Secret
const accountId = must("CF_ACCOUNT_ID");  // GitHub Secret
const project = must("CF_PAGES_PROJECT"); // GitHub Secret
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "main";

async function cf(path) {
  const res = await fetch(`${CF_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    console.error("Cloudflare API error:", res.status, JSON.stringify(json));
    process.exit(1);
  }
  return json.result;
}

(async () => {
  // Get the latest deployment for this branch from Pages project
  // Endpoint: GET /accounts/:account_id/pages/projects/:project/deployments
  // We'll scan results and pick first deployment that matches branch.
  const deployments = await cf(
    `/accounts/${accountId}/pages/projects/${project}/deployments?per_page=20` 
  );

  const d = (deployments || []).find((x) => x?.deployment_trigger?.metadata?.branch === branch);

  if (!d) {
    console.error(`No deployment found for branch: ${branch}`);
    console.error("Make sure Cloudflare Pages is building PR branches.");
    process.exit(1);
  }

  // Cloudflare Pages deployment has urls in `urls` (array). Prefer https URL.
  const urls = d.urls || [];
  const preview = urls.find((u) => /^https:\/\//i.test(u)) || urls[0];

  if (!preview) {
    console.error("No preview URL found in deployment payload.");
    process.exit(1);
  }

  // Output only the URL (for GitHub Actions step output)
  process.stdout.write(preview);
})();
