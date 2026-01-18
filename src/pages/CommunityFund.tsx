import { CheckCircle } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from '../components/ui';

interface CommunityFundProps {
  lang: Language;
}

const CommunityFund = ({ lang }: CommunityFundProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <PremiumSection
        title={t.fund.title}
        centered
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-white/75 text-sm max-w-[70ch] mx-auto leading-relaxed text-center mb-10">
            {t.fund.description}
          </p>

          <PremiumCard className="mb-8" hover={false}>
            <h2 className="text-xl font-semibold text-white mb-4">
              {t.fund.usage.title}
            </h2>
            <div className="space-y-3">
              {t.fund.usage.items.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                  <p className="text-white/75 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </PremiumCard>

          <div className="mb-8">
            <NoticeBox variant="warning" title={t.fund.notice.title}>
              {t.fund.notice.content}
            </NoticeBox>
          </div>

          <PremiumCard hover={false}>
            <h2 className="text-xl font-semibold text-white mb-3">
              {t.fund.progress.title}
            </h2>
            <p className="text-white/55 text-sm italic">
              {t.fund.progress.note}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default CommunityFund;
