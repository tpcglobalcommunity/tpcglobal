import { Shield, FileText, Lock, Globe, Mail } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from '../components/ui';

interface LegalProps {
  lang: Language;
}

const Legal = ({ lang }: LegalProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <PremiumSection
        title={t.legal.title}
        subtitle={t.legal.subtitle}
        centered
        variant="tight"
        padBottom="sm"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.disclaimer.title}
              </h2>
            </div>
            <NoticeBox variant="warning" className="p-6">
              <div className="space-y-3">
                <p>{t.legal.disclaimer.p1}</p>
                <p>{t.legal.disclaimer.p2}</p>
                <p>{t.legal.disclaimer.p3}</p>
                <p>{t.legal.disclaimer.p4}</p>
              </div>
            </NoticeBox>
          </div>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.terms.title}
              </h2>
            </div>
            <div className="space-y-3 text-white/75 text-sm leading-relaxed">
              {t.legal.terms.items.map((item: string, index: number) => (
                <p key={index} className="flex items-start">
                  <span className="text-[#F0B90B] mr-3 text-lg flex-shrink-0">•</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.privacy.title}
              </h2>
            </div>
            <div className="space-y-3 text-white/75 text-sm leading-relaxed">
              {t.legal.privacy.items.map((item: string, index: number) => (
                <p key={index} className="flex items-start">
                  <span className="text-[#F0B90B] mr-3 text-lg flex-shrink-0">•</span>
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Globe className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.jurisdiction.title}
              </h2>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.legal.jurisdiction.content}
            </p>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.contact.title}
              </h2>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.legal.contact.content}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Legal;
