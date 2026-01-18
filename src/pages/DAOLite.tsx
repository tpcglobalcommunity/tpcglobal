import { Vote, CheckCircle, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard } from '../components/ui';

interface DAOLiteProps {
  lang: Language;
}

const DAOLite = ({ lang }: DAOLiteProps) => {
  const t = useTranslations(lang);

  const proposals = [
    {
      title: t.dao.proposalPlaceholder1,
      description: t.dao.proposalPlaceholder1Desc,
      votingPower: 'TBD',
      status: t.dao.sample,
      endDate: 'TBD',
    },
    {
      title: t.dao.proposalPlaceholder2,
      description: t.dao.proposalPlaceholder2Desc,
      votingPower: 'TBD',
      status: t.dao.sample,
      endDate: 'TBD',
    },
    {
      title: t.dao.proposalPlaceholder3,
      description: t.dao.proposalPlaceholder3Desc,
      votingPower: 'TBD',
      status: t.dao.sample,
      endDate: 'TBD',
    },
  ];

  return (
    <PremiumShell>
      <PremiumSection
        title={t.dao.title}
        subtitle={t.dao.subtitle}
        centered
      >
        <PremiumCard className="text-center mb-12" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {t.dao.whatIsDAOLite}
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-[70ch] mx-auto">
            {t.dao.whatIsDAOLiteDesc}
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
                <h3 className="text-base font-semibold text-white mb-2">
                  {t.dao[`step${step}`]}
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">
                  {t.dao[`step${step}Desc`]}
                </p>
                {step < 4 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F0B90B]/40" />
                )}
              </PremiumCard>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <UsersIcon className="w-6 h-6 text-[#F0B90B]" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {t.dao.activeProposals}
            </h2>
          </div>
          <p className="text-white/55 text-sm mb-8 italic">
            {t.dao.sampleDataNote}
          </p>
          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <PremiumCard key={index}>
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {proposal.title}
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed">
                      {proposal.description}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-white/55 text-xs font-medium">
                    {proposal.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-white/10">
                  <div className="flex items-center text-white/75">
                    <Vote className="w-4 h-4 mr-2 text-[#F0B90B]" />
                    <span>
                      {t.dao.votingPower}: <span className="text-white font-medium">{proposal.votingPower}</span>
                    </span>
                  </div>
                  <div className="flex items-center text-white/75">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#F0B90B]" />
                    <span>
                      {t.dao.endDate}: <span className="text-white font-medium">{proposal.endDate}</span>
                    </span>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>

        <PremiumCard hover={false}>
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
      </PremiumSection>
    </PremiumShell>
  );
};

export default DAOLite;
