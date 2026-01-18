import { CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from '../components/ui';

interface DAOLiteProps {
  lang: Language;
}

const DAOLite = ({ lang }: DAOLiteProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <PremiumSection
        title={t.dao.title}
        subtitle={t.dao.subtitle}
        centered
        variant="tight"
        padBottom="sm"
      >
        <PremiumCard className="text-center mb-12" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {t.dao.whatIsDAOLite}
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-[70ch] mx-auto">
            {t.dao.whatIsDAOLiteContent}
          </p>
        </PremiumCard>

        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-8">
            {t.dao.howToParticipate}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <PremiumCard key={step} className="relative">
                <div className="w-10 h-10 mb-4 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center text-black font-bold text-lg">
                  {step}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {t.dao[`step${step}`]}
                </h3>
                {step < 4 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F0B90B]/40" />
                )}
              </PremiumCard>
            ))}
          </div>
        </div>

        <PremiumCard hover={false} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-[#F0B90B]" />
            <h2 className="text-2xl font-semibold text-white">
              {t.dao.rules}
            </h2>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((num) => (
              <p key={num} className="flex items-start text-white/75 text-sm leading-relaxed">
                <span className="text-[#F0B90B] mr-3 text-lg">•</span>
                <span>{t.dao[`rule${num}`]}</span>
              </p>
            ))}
          </div>
        </PremiumCard>

        <div className="pb-0">
          <NoticeBox
            variant="info"
            icon={<AlertCircle />}
          >
            {t.dao.notice}
          </NoticeBox>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default DAOLite;
