import { DollarSign, Users, ArrowRight, Target } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox, ProgressCard } from '../components/ui';

interface CommunityFundProps {
  lang: Language;
}

const CommunityFund = ({ lang }: CommunityFundProps) => {
  const t = useTranslations(lang);

  const totalGoal = 0;
  const totalRaised = 0;
  const progress = 0;

  const fundingGoals = [
    { name: t.fund.goal1, amount: t.fund.goal1Amount, progress: 0 },
    { name: t.fund.goal2, amount: t.fund.goal2Amount, progress: 0 },
    { name: t.fund.goal3, amount: t.fund.goal3Amount, progress: 0 },
    { name: t.fund.goal4, amount: t.fund.goal4Amount, progress: 0 },
  ];

  return (
    <PremiumShell>
      <PremiumSection
        title={t.fund.title}
        subtitle={t.fund.subtitle}
        centered
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-white/75 text-sm max-w-[70ch] mx-auto leading-relaxed text-center mb-10">
            {t.fund.description}
          </p>

          <div className="mb-10">
            <NoticeBox variant="warning">
              {t.fund.disclaimer}
            </NoticeBox>
          </div>

          <PremiumCard className="mb-10" hover={false}>
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-[#F0B90B]" />
              <h2 className="text-2xl font-semibold text-white">
                {t.fund.currentProgress}
              </h2>
            </div>
            <p className="text-white/55 text-sm mb-6 italic px-1">
              {t.fund.sampleDataNote}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.04] rounded-xl p-5 border border-white/10">
                <div className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">
                  {t.fund.raised}
                </div>
                <div className="text-2xl font-bold text-white">
                  {t.fund.zeroBalance}
                </div>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-5 border border-white/10">
                <div className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2">
                  {t.fund.goal}
                </div>
                <div className="text-2xl font-bold text-white">
                  {t.fund.zeroBalance}
                </div>
              </div>
              <div className="bg-white/[0.04] rounded-xl p-5 border border-white/10">
                <div className="text-white/55 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  {t.fund.contributors}
                </div>
                <div className="text-2xl font-bold text-white">0</div>
              </div>
            </div>

            <div className="relative w-full bg-white/[0.04] rounded-full h-6 overflow-hidden border border-white/10">
              <div
                className="absolute h-6 rounded-full transition-all duration-700 bg-gradient-to-r from-[#F0B90B] to-[#C29409]"
                style={{ width: `${progress}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">{progress}%</span>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="mb-10" hover={false}>
            <h2 className="text-2xl font-semibold text-white mb-6">
              {t.fund.howItWorks}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0 text-black font-bold text-base">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1 text-base">
                      {t.fund[`step${step}`]}
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed">
                      {t.fund[`step${step}Desc`]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard className="mb-10" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-[#F0B90B]" />
              <h2 className="text-2xl font-semibold text-white">
                {t.fund.fundingGoals}
              </h2>
            </div>
            <div className="space-y-5">
              {fundingGoals.map((goal, index) => (
                <div key={index} className="bg-white/[0.04] rounded-xl p-5 border border-white/10">
                  <div className="flex justify-between items-center gap-4 mb-3">
                    <span className="text-white font-medium text-sm">{goal.name}</span>
                    <span className="text-white/75 text-sm whitespace-nowrap">{goal.amount}</span>
                  </div>
                  <div className="relative w-full bg-white/[0.04] rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className="absolute h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-[#F0B90B] to-[#C29409]"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          <div className="text-center">
            <Link to={getLangPath(lang, '/docs')}>
              <PremiumButton variant="primary">
                {t.fund.learnMore}
                <ArrowRight className="w-4 h-4" />
              </PremiumButton>
            </Link>
          </div>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default CommunityFund;
