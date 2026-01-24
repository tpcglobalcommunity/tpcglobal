import { CheckCircle, ArrowRight } from 'lucide-react';
import { Language, useI18n } from "@/i18n";
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from "@/components/ui";

interface DAOLiteProps {
  lang: Language;
}

const DAOLite = ({ lang }: DAOLiteProps) => {
  const { t } = useI18n(lang);

  const steps = [
    { num: 1, text: t('dao.step1', 'Proposal Submission') },
    { num: 2, text: t('dao.step2', 'Community Discussion') },
    { num: 3, text: t('dao.step3', 'Voting Period') },
    { num: 4, text: t('dao.step4', 'Implementation') },
  ];

  const rules = [
    t('dao.rule1', 'All members can propose initiatives'),
    t('dao.rule2', 'Voting power is based on token holdings'),
    t('dao.rule3', 'Proposals require minimum quorum'),
    t('dao.rule4', 'Results are transparent and binding'),
  ];

  return (
    <PremiumShell>
      <PremiumSection
        title={t('dao.title', 'DAO Lite')}
        subtitle={t('dao.subtitle', 'Community-Driven Governance')}
        centered
        variant="tight"
        isLast
      >
        <PremiumCard className="text-center mb-12" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {t('dao.whatIsDAOLite', 'What is DAO Lite?')}
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-[70ch] mx-auto">
            {t('dao.whatIsDAOLiteContent', 'A simplified governance model for community decision-making')}
          </p>
        </PremiumCard>

        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white text-center mb-8">
            {t('dao.howToParticipate', 'How to Participate')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <PremiumCard key={step.num} className="relative">
                <div className="w-10 h-10 mb-4 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center text-black font-bold text-lg">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-white">
                  {step.text}
                </h3>
                {step.num < 4 && (
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
              {t('dao.rules', 'DAO Rules')}
            </h2>
          </div>
          <div className="space-y-3">
            {rules.map((rule, index) => (
              <p key={index} className="flex items-start text-white/75 text-sm leading-relaxed">
                <span className="text-[#F0B90B] mr-3 text-lg">•</span>
                <span>{rule}</span>
              </p>
            ))}
          </div>
        </PremiumCard>

        <div className="pb-0">
          <NoticeBox variant="info">
            {t('dao.notice', 'Participation is voluntary and requires token holdings')}
          </NoticeBox>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default DAOLite;
