import { ShieldCheck, TrendingUp, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

interface HomeProps {
  lang: Language;
}

const Home = ({ lang }: HomeProps) => {
  const { t } = useI18n();

  const trustCards = [
    {
      icon: ShieldCheck,
      title: t("home.trust.cards.0.title"),
      desc: t("home.trust.cards.0.desc"),
      cta: t("home.trust.cards.0.cta"),
      link: getLangPath(lang, '/transparency')
    },
    {
      icon: BookOpen,
      title: t("home.trust.cards.1.title"),
      desc: t("home.trust.cards.1.desc"),
      cta: t("home.trust.cards.1.cta"),
      link: getLangPath(lang, '/docs')
    },
    {
      icon: Users,
      title: t("home.trust.cards.2.title"),
      desc: t("home.trust.cards.2.desc"),
      cta: t("home.trust.cards.2.cta"),
      link: getLangPath(lang, '/dao')
    }
  ];

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#C29409]/10 border border-[#F0B90B]/20 mb-8">
            <TrendingUp className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">
              {t("home.badge")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t("home.title")}
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("home.subtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PremiumButton 
              variant="primary" 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => {
                // Placeholder untuk join/signup
                const joinUrl = 'https://t.me/tpcglobalcommunity';
                window.open(joinUrl, '_blank');
              }}
            >
              {t("home.ctaPrimary")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </PremiumButton>
            
            <Link to={getLangPath(lang, '/docs')}>
              <PremiumButton variant="secondary" size="sm" className="w-full sm:w-auto">
                <BookOpen className="w-5 h-5 mr-2" />
                {t("home.ctaSecondary")}
              </PremiumButton>
            </Link>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-16">
          <NoticeBox variant="warning">
            <div className="text-white/90 leading-relaxed">
              {t("home.disclaimer")}
            </div>
          </NoticeBox>
        </div>

        {/* Trust Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {t("home.trust.title")}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustCards.map((card, index) => (
              <PremiumCard key={index}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B]/10 to-[#C29409]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <card.icon className="w-6 h-6 text-[#F0B90B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                      {card.desc}
                    </p>
                  </div>
                </div>
                
                <Link to={card.link}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    {card.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </PremiumButton>
                </Link>
              </PremiumCard>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join thousands of disciplined traders who are building their skills with education, tools, and transparent community support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton 
                variant="primary" 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={() => {
                  const telegramUrl = 'https://t.me/tpcglobalcommunity';
                  window.open(telegramUrl, '_blank');
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                {t("home.ctaPrimary")}
              </PremiumButton>
              
              <Link to={getLangPath(lang, '/docs')}>
                <PremiumButton variant="secondary" size="sm" className="w-full sm:w-auto">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("home.ctaSecondary")}
                </PremiumButton>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PremiumShell>
  );
};

export default Home;
