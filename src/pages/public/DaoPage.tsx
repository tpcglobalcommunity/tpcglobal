import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function DaoPage() {
  const { t, withLang } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
              {t('dao.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('dao.subtitle')}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <p className="text-white text-lg mb-6">
                {t('dao.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gold mb-3">Governance</h3>
                  <p className="text-text-secondary">Community-driven decision making</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gold mb-3">Transparency</h3>
                  <p className="text-text-secondary">Open and verifiable processes</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(withLang('/dao/how-it-works'))}>
                  Learn More
                </Button>
                <Button variant="outline" onClick={() => navigate(withLang('/dao/proposals'))}>
                  View Proposals
                </Button>
              </div>
            </CardContent>
          </Card>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
