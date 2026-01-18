import { Shield, AlertTriangle, FileText, Lock, Cookie, Mail, ExternalLink, BookOpen, Eye, Users } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, NoticeBox, Accordion, AccordionItem, PremiumButton } from '../components/ui';
import { Link } from '../components/Router';

interface LegalProps {
  lang: Language;
}

const Legal = ({ lang }: LegalProps) => {
  const t = useTranslations(lang);

  const sectionIcons = {
    disclaimer: Shield,
    risk: AlertTriangle,
    terms: FileText,
    privacy: Lock,
    cookies: Cookie,
    support: Mail,
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <Shield className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.legal.header.pill}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t.legal.header.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              {t.legal.header.subtitle}
            </p>
          </div>

          <NoticeBox
            variant="warning"
            title={t.legal.header.noticeTitle}
          >
            {t.legal.header.noticeBody}
          </NoticeBox>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent mb-12" />

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {t.legal.quickLinks.title}
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={getLangPath(lang, '/docs')}>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-[#F0B90B]/30 text-white hover:text-[#F0B90B] transition-all duration-200 font-medium">
                <BookOpen className="w-5 h-5" />
                {t.legal.quickLinks.docs}
              </button>
            </Link>
            <Link to={getLangPath(lang, '/transparency')}>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-[#F0B90B]/30 text-white hover:text-[#F0B90B] transition-all duration-200 font-medium">
                <Eye className="w-5 h-5" />
                {t.legal.quickLinks.transparency}
              </button>
            </Link>
            <a
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-[#F0B90B]/30 text-white hover:text-[#F0B90B] transition-all duration-200 font-medium"
            >
              <Users className="w-5 h-5" />
              {t.legal.quickLinks.community}
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <Accordion>
            {Object.entries(t.legal.sections).map(([key, section]) => {
              const Icon = sectionIcons[key as keyof typeof sectionIcons];
              return (
                <AccordionItem
                  key={key}
                  title={section.title}
                  defaultOpen={key === 'disclaimer'}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      {Icon && (
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white/80 text-sm leading-relaxed mb-4">
                          {section.summary}
                        </p>
                      </div>
                    </div>

                    <div className="pl-13 space-y-2">
                      {section.points.map((point: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                        >
                          <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">•</span>
                          <span className="text-white/75 text-sm leading-relaxed">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>

          <PremiumCard hover={false}>
            <div className="text-center py-6">
              <p className="text-white/60 text-sm">
                {t.legal.lastUpdated}: <span className="text-white/80 font-medium">2026-01-18</span>
              </p>
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-[#F0B90B]" />
                <h2 className="text-2xl md:text-3xl font-semibold text-white">
                  {t.legal.cta.title}
                </h2>
              </div>
              <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
                {t.legal.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={getLangPath(lang, '/docs')}>
                  <PremiumButton variant="primary">
                    <BookOpen className="w-5 h-5" />
                    {t.legal.cta.docs}
                  </PremiumButton>
                </Link>
                <Link to={getLangPath(lang, '/transparency')}>
                  <PremiumButton variant="secondary">
                    <Eye className="w-5 h-5" />
                    {t.legal.cta.transparency}
                  </PremiumButton>
                </Link>
                <PremiumButton
                  variant="secondary"
                  href="https://t.me/tpcglobalcommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t.legal.cta.community}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
};

export default Legal;
