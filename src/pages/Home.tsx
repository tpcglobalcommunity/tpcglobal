import { Eye, Users, TrendingUp, Shield } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';

interface HomeProps {
  lang: Language;
}

const Home = ({ lang }: HomeProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 mb-3 fade-in">
            <Shield className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-white">{t.home.subtitle}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tight fade-in">
            {t.home.title}
          </h1>

          <p className="text-base text-white/75 mb-5 md:mb-6 max-w-[70ch] mx-auto leading-relaxed fade-in">
            {t.home.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-5 md:mb-6 fade-in">
            <PremiumButton
              variant="primary"
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.home.joinCommunity}
            </PremiumButton>
            <Link to={getLangPath(lang, '/docs')}>
              <PremiumButton variant="secondary">
                {t.home.learnMore}
              </PremiumButton>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto fade-in">
            <NoticeBox variant="warning">
              {t.home.disclaimer}
            </NoticeBox>
          </div>
        </div>
      </section>

      <PremiumSection
        title={t.home.whatIsTPC}
        subtitle={t.home.whatIsTPCDesc}
        centered
      />

      <PremiumSection>
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 md:mb-4">
            {t.home.ourMission}
          </h2>
          <p className="text-white/75 text-base max-w-[70ch] mx-auto leading-relaxed">
            {t.home.ourMissionDesc}
          </p>
        </PremiumCard>
      </PremiumSection>

      <PremiumSection title={t.home.keyPrinciples} centered>
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <Eye className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.nav.transparency}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <Users className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.nav.dao}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.home.community}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <Eye className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.home.transparency}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.home.transparencyDesc}
            </p>
          </PremiumCard>

          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <Users className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.home.community}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.home.communityDesc}
            </p>
          </PremiumCard>

          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.home.utility}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.home.utilityDesc}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight">
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 md:mb-4">
            {t.home.joinCommunity}
          </h2>
          <p className="text-white/75 text-base max-w-[60ch] mx-auto leading-relaxed mb-5 md:mb-6">
            {t.home.description}
          </p>
          <PremiumButton
            variant="primary"
            href="https://t.me/tpcglobalcommunity"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.home.joinCommunity}
          </PremiumButton>
        </PremiumCard>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Home;
