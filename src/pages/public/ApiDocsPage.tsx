import { Language, useI18n, getLangPath } from "@/i18n";
import { Link } from "@/components/Router";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { Code, ExternalLink, Shield, Clock, Database } from "lucide-react";

interface ApiDocsProps {
  lang?: Language;
}

const ApiDocs = ({ lang }: ApiDocsProps) => {
  const { t } = useI18n();

  const FUNCTION_BASE_URL = "{FUNCTION_BASE_URL}";

  const endpoints = [
    {
      method: "GET",
      path: "/metrics",
      description: t("api.metricsDesc"),
      example: `// V1 (recommended)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/v1/metrics")
  .then(r => r.json())
  .then(console.log);

// Legacy (deprecated)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/metrics")
  .then(r => r.json())
  .then(console.log);`
    },
    {
      method: "GET", 
      path: "/daily?days=7|30|90",
      description: t("api.dailyDesc"),
      example: `// V1 (recommended)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/v1/daily?days=30")
  .then(r => r.json())
  .then(console.log);

// Legacy (deprecated)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/daily?days=30")
  .then(r => r.json())
  .then(console.log);`
    },
    {
      method: "GET",
      path: "/wallets", 
      description: t("api.walletsDesc"),
      example: `// V1 (recommended)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/v1/wallets")
  .then(r => r.json())
  .then(console.log);

// Legacy (deprecated)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/wallets")
  .then(r => r.json())
  .then(console.log);`
    },
    {
      method: "GET",
      path: "/batches?limit=10",
      description: t("api.batchesDesc"),
      example: `// V1 (recommended)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/v1/batches?limit=10")
  .then(r => r.json())
  .then(console.log);

// Legacy (deprecated)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/batches?limit=10")
  .then(r => r.json())
  .then(console.log);`
    },
    {
      method: "GET",
      path: "/changelog?limit=20",
      description: t("api.changelogDesc"),
      example: `// V1 (recommended)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/v1/changelog?limit=20")
  .then(r => r.json())
  .then(console.log);

// Legacy (deprecated)
fetch("${FUNCTION_BASE_URL}/tpc-public-api/public/changelog?limit=20")
  .then(r => r.json())
  .then(console.log);`
    }
  ];

  const noticeBullets = [
    "This API is read-only and returns aggregated data only.",
    "No personal member data is exposed.",
    "This documentation is for transparency and verification purposes."
  ];

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 mb-4">
              <Shield className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-semibold text-white">
                {t("api.title")}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              {t("api.title")}
            </h1>
            <p className="text-base text-white/75 mb-6 max-w-[70ch] mx-auto leading-relaxed">
              {t("api.subtitle")}
            </p>
          </div>

          {/* Notice */}
          <div className="mb-8">
            <NoticeBox variant="warning">
              <h3 className="font-semibold text-white mb-3">{t("api.noticeTitle")}</h3>
              <ul className="space-y-2 text-sm text-white/80">
                {noticeBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#F0B90B] mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </NoticeBox>
          </div>

          {/* Base URL */}
          <PremiumCard className="mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-[#F0B90B]" />
                <h2 className="text-xl font-semibold text-white">{t("api.baseUrlTitle")}</h2>
              </div>
              <div className="bg-emerald-500/10 rounded-lg p-4 font-mono text-sm text-emerald-300 mb-4">
                {FUNCTION_BASE_URL}/tpc-public-api/public/v1
              </div>
              <p className="text-sm text-white/60 mb-4">
                {t("api.baseUrlHint")}
              </p>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-sm text-amber-200">
                  {t("api.deprecationNote")}
                </p>
              </div>
            </div>
          </PremiumCard>

          {/* Schema Section */}
          <PremiumCard className="mb-8">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-[#F0B90B]" />
                <h2 className="text-xl font-semibold text-white">{t("api.schemaTitle")}</h2>
              </div>
              <p className="text-sm text-white/70 mb-6">
                {t("api.schemaDesc")}
              </p>

              {/* Schema Note */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                <p className="text-sm text-amber-200">
                  {t("api.schemaNote")}
                </p>
              </div>

              {/* Envelope */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaEnvelope")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "metrics"
  },
  "data": {}
}`}</pre>
                </div>
              </div>

              {/* Metrics Schema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaMetrics")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "metrics"
  },
  "data": {
    "total_revenue": "0.000000",
    "verified_revenue": "0.000000",
    "distributed_revenue": "0.000000",
    "tx_total": 0,
    "tx_verified": 0,
    "tx_distributed": 0,
    "distributed": {
      "referral": "0.000000",
      "treasury": "0.000000",
      "buyback": "0.000000"
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Daily Schema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaDaily")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "daily",
    "days": 30
  },
  "data": [
    {
      "day": "2026-01-01",
      "revenue": "0.000000",
      "tx_count": 0,
      "referral": "0.000000",
      "treasury": "0.000000",
      "buyback": "0.000000"
    }
  ]
}`}</pre>
                </div>
              </div>

              {/* Wallets Schema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaWallets")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "wallets"
  },
  "data": {
    "treasury": {
      "label": "Treasury Wallet",
      "address": "..."
    },
    "buyback": {
      "label": "Buyback Wallet",
      "address": "..."
    },
    "burn": {
      "label": "Burn Wallet",
      "address": "..."
    },
    "liquidity": {
      "label": "Liquidity Wallet",
      "address": "..."
    }
  }
}`}</pre>
                </div>
              </div>

              {/* Batches Schema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaBatches")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "batches",
    "limit": 10
  },
  "data": [
    {
      "id": "uuid",
      "created_at": "2026-01-26T00:00:00.000Z",
      "period_start": "2026-01-25T00:00:00.000Z",
      "period_end": "2026-01-26T00:00:00.000Z",
      "tx_count": 0,
      "revenue_sum": "0.000000",
      "referral_sum": "0.000000",
      "treasury_sum": "0.000000",
      "buyback_sum": "0.000000",
      "public_hash": "a1b2c3d4e5f6...",
      "onchain_tx": "3AbcDeFgHiJkLmNoPqRsTuVwXyZ1234567890abcdef",
      "note": "Auto distribution batch"
    }
  ]
}`}</pre>
                </div>
              </div>

              {/* Changelog Schema */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaChangelog")}</h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-xs text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "changelog",
    "limit": 20
  },
  "data": [
    {
      "changed_at": "2026-01-26T00:00:00.000Z",
      "key": "distribution_split",
      "summary": "distribution_split updated: referral=0.1, treasury=0.2, buyback=0.05"
    }
  ]
}`}</pre>
                </div>
              </div>

              {/* Error Schema */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{t("api.schemaError")}</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <pre className="text-xs text-red-300 font-mono overflow-x-auto">
{`{
  "ok": false,
  "error": "Rate limit exceeded"
}`}</pre>
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Endpoints */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-5 h-5 text-[#F0B90B]" />
              <h2 className="text-xl font-semibold text-white">{t("api.endpointsTitle")}</h2>
            </div>
            
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <PremiumCard key={index}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded">
                          {endpoint.method}
                        </span>
                        <code className="text-sm text-white/90 font-mono">
                          {endpoint.path}
                        </code>
                      </div>
                    </div>
                    
                    <p className="text-sm text-white/70 mb-4">
                      {endpoint.description}
                    </p>
                    
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/60 font-mono">Example</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(endpoint.example)}
                          className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <pre className="text-xs text-white/90 font-mono overflow-x-auto">
                        {endpoint.example}
                      </pre>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </div>

          {/* Rate Limits & Caching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <PremiumCard>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#F0B90B]" />
                  <h3 className="text-lg font-semibold text-white">{t("api.rateTitle")}</h3>
                </div>
                <p className="text-sm text-white/70">
                  {t("api.rateDesc")}
                </p>
              </div>
            </PremiumCard>

            <PremiumCard>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-[#F0B90B]" />
                  <h3 className="text-lg font-semibold text-white">{t("api.policyTitle")}</h3>
                </div>
                <p className="text-sm text-white/70">
                  {t("api.policyDesc")}
                </p>
              </div>
            </PremiumCard>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link to={getLangPath(lang || 'en', '/transparency')}>
              <PremiumButton variant="primary" className="inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {t("api.ctaTransparency")}
              </PremiumButton>
            </Link>
          </div>
        </div>
      </section>
    </PremiumShell>
  );
};

export default ApiDocs;
