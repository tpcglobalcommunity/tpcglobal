import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Shield, Eye, TrendingUp, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { BuyAntiScamModal } from '../../components/security/BuyAntiScamModal';
import { AddressPreviewCard } from '../../components/security/AddressPreviewCard';

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
      {/* Anti-Scam Banner */}
      <div className="bg-warning/10 border-b border-warning">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-sm text-warning font-medium">
                {t('home.hero.antiScam')}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(withLang('/verified'))}
              className="border-warning text-warning hover:bg-warning hover:text-black"
            >
              {t('nav.verified')}
            </Button>
          </div>
        </div>
      </div>

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
          <div className="space-y-3 mb-12">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="group cursor-pointer border border-gray-800 hover:border-gray-700 transition-all duration-200 bg-gray-900/50 hover:bg-gray-900/80"
                  onClick={action.onClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-lg bg-gray-800/50 group-hover:bg-gray-700/50 flex items-center justify-center transition-colors duration-200">
                        <Icon className="h-6 w-6 text-gold" />
                      </div>

                      {/* Text Block */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white mb-1">
                          {action.title}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {action.subtitle}
                        </div>
                      </div>

                      {/* Chevron */}
                      <div className="text-gray-500 group-hover:text-gray-400 transition-colors duration-200">
                        <ChevronRight className="h-5 w-5" />
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

      {/* Security Notice */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Alert variant="warning" title="Security First">
            <div className="space-y-4">
              <p className="text-white">
                Always verify wallet addresses before sending funds. TPC Global will never ask for your private keys or seed phrases.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAntiScamModal(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Security Checklist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(withLang('/verified'))}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Verify Wallets
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      </section>

      {/* Anti-Scam Modal */}
      <BuyAntiScamModal
        isOpen={showAntiScamModal}
        onClose={() => setShowAntiScamModal(false)}
        onContinue={() => setShowAntiScamModal(false)}
      />
    </div>
  );
}
