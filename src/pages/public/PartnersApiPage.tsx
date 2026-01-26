import { useState } from "react";
import { useI18n } from "@/i18n";
import { Copy, ArrowRight, Terminal, Globe, Shield, Clock } from "lucide-react";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";

function CodeBlock({ 
  children, 
  title 
}: { 
  children: string; 
  title: string; 
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/80">{title}</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
        >
          {copied ? (
            <>
              <div className="w-3 h-3 text-emerald-400">✓</div>
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="bg-black/50 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-white/90 font-mono">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}

export default function PartnersApiPage({ lang }: { lang: string }) {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-[#F0B90B] bg-[#F0B90B]/10 px-3 py-1 rounded-full">
              {t("partnersApi.title")}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("partnersApi.title")}
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t("partnersApi.subtitle")}
          </p>
        </div>

        {/* Main Content */}
        <PremiumCard>
          <div className="p-8">
            {/* Scope & Rules */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-white mb-6">
                {t("partnersApi.scopeTitle")}
              </h2>
              <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-lg p-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#F0B90B]" />
                    <span className="text-white/90">{t("partnersApi.scope1")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#F0B90B]" />
                    <span className="text-white/90">{t("partnersApi.scope2")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#F0B90B]" />
                    <span className="text-white/90">{t("partnersApi.scope3")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#F0B90B]" />
                    <span className="text-white/90">{t("partnersApi.scope4")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Base URL */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t("partnersApi.baseUrlTitle")}
              </h3>
              <div className="bg-black/50 rounded-lg p-4">
                <code className="text-sm text-white/90 font-mono">
                  {t("partnersApi.baseUrl")}
                </code>
              </div>
              <p className="text-sm text-white/60 mt-2">
                {t("partnersApi.baseUrlNote")}
              </p>
            </div>

            {/* Endpoints */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("partnersApi.endpointsTitle")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.endpoint1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.endpoint2")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.endpoint3")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.endpoint4")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.endpoint5")}</span>
                </div>
              </div>
            </div>

            {/* Response Envelope */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t("partnersApi.envelopeTitle")}
              </h3>
              <div className="bg-black/50 rounded-lg p-4">
                <pre className="text-sm text-white/90 font-mono overflow-x-auto">
{`{
  "ok": true,
  "version": "v1",
  "meta": {
    "generated_at": "2026-01-26T00:00:00.000Z",
    "endpoint": "metrics"
  },
  "data": {
    // Endpoint-specific data
  }
}`}
                </pre>
              </div>
            </div>

            {/* Quick Start */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("partnersApi.quickStartTitle")}
              </h3>
              
              <CodeBlock
                title={t("partnersApi.jsTitle")}
              >
                {t("partnersApi.jsCode")}
              </CodeBlock>

              <CodeBlock
                title={t("partnersApi.curlTitle")}
              >
                {t("partnersApi.curlCode")}
              </CodeBlock>
            </div>

            {/* Best Practices */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("partnersApi.bestPracticesTitle")}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.practice1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.practice2")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.practice3")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.practice4")}</span>
                </div>
              </div>
            </div>

            {/* SLA */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("partnersApi.slaTitle")}
              </h3>
              <div className="grid md:grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.sla1")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.sla2")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-white/80">{t("partnersApi.sla3")}</span>
                </div>
              </div>
            </div>

            {/* Contact & Attribution */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("partnersApi.contactTitle")}
              </h3>
              <div className="bg-black/50 rounded-lg p-4 mb-4">
                <p className="text-white/90 font-mono text-sm">
                  {t("partnersApi.attribution")}
                </p>
              </div>
              <p className="text-sm text-white/60">
                {t("partnersApi.specialNeeds")}
              </p>
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <PremiumButton
                onClick={() => window.location.href = `/${lang}/transparency`}
                className="flex items-center gap-2"
              >
                {t("partnersApi.viewTransparency")}
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <NoticeBox variant="info">
            <p className="text-white/90">
              This API provides read-only access to aggregated transparency data. No personal information is exposed, and all data is anonymized for privacy protection.
            </p>
          </NoticeBox>
        </div>
      </div>
    </PremiumShell>
  );
}
