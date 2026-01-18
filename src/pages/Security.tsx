import { ShieldAlert, Link2, BadgeCheck, AlertTriangle, ExternalLink, ChevronRight, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';

interface SecurityProps {
  lang: Language;
}

const Security = ({ lang }: SecurityProps) => {
  const t = useTranslations(lang);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <ShieldAlert className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.security.header.pill}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.security.header.title}
            </h1>
            <p className="text-lg text-white/70 max-w-[60ch] mx-auto leading-relaxed mb-6">
              {t.security.header.subtitle}
            </p>
            <NoticeBox variant="warning">
              <div>
                <strong className="font-semibold">{t.security.header.noticeTitle}</strong>
                <p className="mt-1 text-sm">{t.security.header.noticeBody}</p>
              </div>
            </NoticeBox>
          </div>
        </div>
      </section>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <PremiumCard hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20">
                <BadgeCheck className="w-5 h-5 text-[#F0B90B]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{t.security.official.title}</h2>
            </div>
            <div className="space-y-3">
              {t.security.official.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Link2 className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white/60 mb-1">{item.label}</div>
                      {item.type === 'external' ? (
                        <a
                          href={item.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-[#F0B90B] transition-colors inline-flex items-center gap-1 break-all"
                        >
                          {item.value}
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        </a>
                      ) : (
                        <Link to={item.value}>
                          <span className="text-white font-medium hover:text-[#F0B90B] transition-colors inline-flex items-center gap-1 cursor-pointer">
                            {item.value}
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, idx)}
                    className="flex-shrink-0 ml-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 transition-all"
                    title="Copy"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white">{t.security.rules.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.security.rules.items.map((rule: any, idx: number) => (
              <PremiumCard key={idx} hover={false}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">{rule.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <PremiumCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20">
                <ShieldAlert className="w-5 h-5 text-[#F0B90B]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{t.security.verify.title}</h2>
            </div>
            <div className="space-y-3 mb-6">
              {t.security.verify.body.map((text: string, idx: number) => (
                <p key={idx} className="text-white/70 leading-relaxed">
                  {text}
                </p>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={getLangPath(lang, '/transparency')}>
                <PremiumButton variant="primary">
                  {t.security.verify.ctaTransparency}
                </PremiumButton>
              </Link>
              <Link to={getLangPath(lang, '/legal')}>
                <PremiumButton variant="secondary">
                  {t.security.verify.ctaLegal}
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight" isLast>
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            {t.security.report.title}
          </h2>
          <p className="text-white/70 text-base max-w-[60ch] mx-auto leading-relaxed mb-6">
            {t.security.report.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={getLangPath(lang, '/support')}>
              <PremiumButton variant="primary">
                {t.security.report.ctaSupport}
              </PremiumButton>
            </Link>
            <a href="https://t.me/tpcglobalcommunity" target="_blank" rel="noopener noreferrer">
              <PremiumButton variant="secondary">
                {t.security.report.ctaCommunity}
              </PremiumButton>
            </a>
          </div>
        </PremiumCard>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Security;
