import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent } from '../../components/ui/Card';

export function DaoProposalsComingSoonPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
              {t('dao.proposals.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('dao.proposals.description')}
            </p>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-gold mb-4">
                {t('dao.proposals.comingSoon')}
              </h2>
              <p className="text-text-secondary mb-6">
                The proposal system is currently under development. Soon you'll be able to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div className="p-4 bg-surface rounded-lg">
                  <p className="text-white">• Submit new proposals</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <p className="text-white">• Vote on community decisions</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <p className="text-white">• Track proposal status</p>
                </div>
                <div className="p-4 bg-surface rounded-lg">
                  <p className="text-white">• Participate in governance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
