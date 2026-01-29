import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Shield, Eye, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { BuyAntiScamModal } from '../../components/security/BuyAntiScamModal';
import { AddressPreviewCard } from '../../components/security/AddressPreviewCard';
import { AntiScamBanner } from '../../components/security/AntiScamBanner';

export function HomePage() {
  const { t, withLang } = useI18n();
  const navigate = useNavigate();
  const [showAntiScamModal, setShowAntiScamModal] = useState(false);

  const actions = [
    {
      icon: Shield,
      title: t('home.actions.verifyWallets.title'),
      subtitle: t('home.actions.verifyWallets.subtitle'),
      onClick: () => navigate(withLang('/verified')),
    },
    {
      icon: Eye,
      title: t('home.actions.viewTransparency.title'),
      subtitle: t('home.actions.viewTransparency.subtitle'),
      onClick: () => navigate(withLang('/transparency')),
    },
    {
      icon: TrendingUp,
      title: t('home.actions.presaleStats.title'),
      subtitle: t('home.actions.presaleStats.subtitle'),
      onClick: () => navigate(withLang('/presale-stats')),
    },
    {
      icon: BookOpen,
      title: t('home.actions.howToBuySafely.title'),
      subtitle: t('home.actions.howToBuySafely.subtitle'),
      onClick: () => navigate(withLang('/how-to-buy-safely')),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Global Anti-Scam Banner */}
      <AntiScamBanner showReportScam={true} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gold-text">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-lg text-text mb-12">
            {t('home.hero.description')}
          </p>
        </div>
      </section>

      {/* Trust Actions Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {t('home.trust.title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              {t('home.trust.description')}
            </p>
          </div>

          {/* Premium Action List */}
          <div className="space-y-2 mb-12">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer border border-white/10 hover:border-white/15 transition-all duration-200 bg-white/3 hover:bg-white/6 backdrop-blur-sm rounded-xl active:scale-[0.99] focus:outline-none focus:ring-1 focus:ring-white/20"
                  onClick={action.onClick}
                >
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center transition-colors duration-200">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>

                      {/* Text Block */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white mb-1">
                          {action.title}
                        </div>
                        <div className="text-sm text-white/60">
                          {action.subtitle}
                        </div>
                      </div>

                      {/* Chevron */}
                      <div className="text-white/40 transition-colors duration-200">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Official Wallets Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gold">
              {t('verified.title')}
            </h2>
            <p className="text-lg text-text-secondary">
              {t('verified.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <OfficialWalletsCard />
            <AddressPreviewCard />
          </div>
        </div>
      </section>

      {/* Anti-Scam Modal */}
      <BuyAntiScamModal
        isOpen={showAntiScamModal}
        onClose={() => setShowAntiScamModal(false)}
        onContinue={() => setShowAntiScamModal(false)}
      />

      {/* Security Notice */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-white/5 border border-white/20 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Security First
            </h3>
            <div className="space-y-4">
              <p className="text-white">
                Always verify wallet addresses before sending funds. TPC Global will never ask for your private keys or seed phrases.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAntiScamModal(true)}
                >
                  Security Checklist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(withLang('/verified'))}
                >
                  Verify Wallets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
