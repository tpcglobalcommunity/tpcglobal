import { Shield, BookOpen, ExternalLink } from 'lucide-react';
import { Language, useI18n, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumButton, NoticeBox } from '../components/ui';

interface HomeProps {
  lang?: Language;
}

const Home = ({ lang }: HomeProps) => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 mb-3 fade-in">
            <Shield className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-white">
              {t('home.hero.badge')}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tight fade-in">
            {t('home.hero.title')}
          </h1>

          <p className="text-base text-white/75 mb-5 md:mb-6 max-w-[70ch] mx-auto leading-relaxed fade-in">
            {t('home.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-5 md:mb-6 fade-in">
            <PremiumButton
              variant="primary"
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('home.hero.ctaPrimary')}
            </PremiumButton>
            <Link to={getLangPath(lang || 'en', '/docs')}>
              <PremiumButton variant="secondary">
                {t('home.hero.ctaSecondary')}
              </PremiumButton>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto fade-in">
            <NoticeBox variant="warning">
              {t('home.disclaimer.text')}
            </NoticeBox>
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            {t('home.trust.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[
              { icon: BookOpen, link: '/transparency' },
              { icon: Shield, link: '/docs' },
              { icon: ExternalLink, link: '/dao' }
            ].map((item, index) => (
              <div key={index} className="backdrop-blur-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
                <item.icon className="w-8 h-8 text-[#F0B90B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(`home.trust.cards[${index}].title`)}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {t(`home.trust.cards[${index}].desc`)}
                </p>
                <Link to={getLangPath(lang || 'en', item.link)}>
                  <PremiumButton variant={index === 2 ? "primary" : "secondary"} size="sm">
                    {t(`home.trust.cards[${index}].cta`, t('common.learnMore'))}
                  </PremiumButton>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PremiumShell>
  );
};

export default Home;
