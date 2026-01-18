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
            <span className="text-sm font-semibold text-white">{t.hero.subtitle}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tight fade-in">
            {t.hero.title}
          </h1>

          <p className="text-base text-white/75 mb-5 md:mb-6 max-w-[70ch] mx-auto leading-relaxed fade-in">
            {t.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-5 md:mb-6 fade-in">
            <PremiumButton
              variant="primary"
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.hero.ctaPrimary}
            </PremiumButton>
            <Link to={getLangPath(lang, '/docs')}>
              <PremiumButton variant="secondary">
                {t.hero.ctaSecondary}
              </PremiumButton>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto fade-in">
            <NoticeBox variant="warning">
              {t.hero.disclaimer}
            </NoticeBox>
          </div>
        </div>
      </section>

      <PremiumSection
        title={t.about.title}
        subtitle={t.about.content}
        centered
        variant="compact"
      />

      <PremiumSection variant="compact">
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 md:mb-4">
            {t.mission.title}
          </h2>
          <p className="text-white/75 text-base max-w-[70ch] mx-auto leading-relaxed">
            {t.mission.content}
          </p>
        </PremiumCard>
      </PremiumSection>

      <PremiumSection title={t.principles.title} centered variant="compact">
        <div className="flex flex-wrap justify-center gap-2 mb-5 md:mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <Eye className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.principles.items.transparency}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <Users className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.principles.items.dao}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-sm font-medium text-white">
            <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" />
            {t.principles.items.community}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <Eye className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.principles.items.transparency}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.principles.descriptions.transparency}
            </p>
          </PremiumCard>

          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <Users className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.principles.items.community}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.principles.descriptions.community}
            </p>
          </PremiumCard>

          <PremiumCard className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#F0B90B] to-[#C29409] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t.principles.items.utility}
            </h3>
            <p className="text-white/75 text-sm leading-relaxed">
              {t.principles.descriptions.utility}
            </p>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight" className="pb-0">
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 md:mb-4">
            {t.cta.title}
          </h2>
          <p className="text-white/75 text-base max-w-[60ch] mx-auto leading-relaxed mb-5 md:mb-6">
            {t.cta.description}
          </p>
          <PremiumButton
            variant="primary"
            href="https://t.me/tpcglobalcommunity"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.cta.title}
          </PremiumButton>
        </PremiumCard>
      </PremiumSection>

      <div className="relative h-px mx-auto max-w-6xl px-4 sm:px-6 mt-8 md:mt-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F0B90B]/20 to-transparent blur-md"></div>
      </div>
    </PremiumShell>
  );
};

export default Home;
