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
      >
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/30 backdrop-blur-xl rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.disclaimer}
              </h2>
            </div>
            <div className="space-y-3 text-[#F0B90B]/90 text-sm leading-relaxed">
              <p>{t.legal.disclaimerContent1}</p>
              <p>{t.legal.disclaimerContent2}</p>
              <p>{t.legal.disclaimerContent3}</p>
            </div>
          </div>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.terms}
              </h2>
            </div>
            <div className="space-y-3 text-white/75 text-sm leading-relaxed">
              {[1, 2, 3, 4].map((num) => (
                <p key={num} className="flex items-start">
                  <span className="text-[#F0B90B] mr-3 text-lg flex-shrink-0">•</span>
                  <span>{t.legal[`termsContent${num}`]}</span>
                </p>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.privacy}
              </h2>
            </div>
            <div className="space-y-3 text-white/75 text-sm leading-relaxed">
              {[1, 2, 3, 4].map((num) => (
                <p key={num} className="flex items-start">
                  <span className="text-[#F0B90B] mr-3 text-lg flex-shrink-0">•</span>
                  <span>{t.legal[`privacyContent${num}`]}</span>
                </p>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Globe className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.jurisdiction}
              </h2>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.legal.jurisdictionContent}
            </p>
          </PremiumCard>

          <PremiumCard>
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-6 h-6 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <h2 className="text-2xl font-semibold text-white">
                {t.legal.contact}
              </h2>
            </div>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.legal.contactContent}
              <a
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0B90B] hover:text-[#F8D568] transition-colors font-medium ml-1"
              >
                @tpcglobalcommunity
              </a>
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Legal;
