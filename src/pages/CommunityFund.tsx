import { CheckCircle } from 'lucide-react';
import { Language, useI18n, tArr } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from '../components/ui';

interface CommunityFundProps {
  lang: Language;
}

const CommunityFund = ({ lang }: CommunityFundProps) => {
  const { t } = useI18n(lang);

  return (
    <PremiumShell>
      <PremiumSection
        title={t("fund.title", "Community Development Support")}
        centered
        variant="tight"
        isLast
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-white/75 text-sm max-w-[70ch] mx-auto leading-relaxed text-center mb-10">
            {t("fund.description", "Community members may voluntarily contribute to support the development of the TPC ecosystem.")}
          </p>

          <PremiumCard className="mb-8" hover={false}>
            <h2 className="text-xl font-semibold text-white mb-4">
              {t("fund.usage.title", "Use of Contributions")}
            </h2>
            <div className="space-y-3">
              {tArr("fund.usage.items", []).map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                  <p className="text-white/75 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </PremiumCard>

          <div className="mb-8">
            <NoticeBox variant="warning" title={t("fund.notice.title", "Important Notice")}>
              {t("fund.notice.content", "This program is NOT an investment. Contributions are voluntary, non-refundable, and do not grant ownership, profit rights, or financial returns. There are no guarantees of any kind.")}
            </NoticeBox>
          </div>

          <PremiumCard hover={false}>
            <h2 className="text-xl font-semibold text-white mb-3">
              {t("fund.progress.title", "Current Progress")}
            </h2>
            <p className="text-white/55 text-sm italic">
              {t("fund.progress.note", "Progress data is sample only and will be updated after the official launch.")}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default CommunityFund;
