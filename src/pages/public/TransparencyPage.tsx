import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExternalLink } from 'lucide-react';

export function TransparencyPage() {
  const { t, withLang } = useI18n();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('transparency.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('transparency.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>{t('transparency.what')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-white">• Complete wallet transparency</p>
                  <p className="text-white">• Real-time transaction tracking</p>
                  <p className="text-white">• Public audit trails</p>
                  <p className="text-white">• Community verification</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('transparency.how')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-white">• Blockchain explorer integration</p>
                  <p className="text-white">• Smart contract verification</p>
                  <p className="text-white">• Regular security audits</p>
                  <p className="text-white">• Open source development</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <OfficialWalletsCard />

          <div className="mt-12 text-center">
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.open(withLang('/verified'), '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('nav.verified')}
              </Button>
              <Button variant="outline" onClick={() => window.open(withLang('/presale-stats'), '_blank')}>
                {t('nav.presaleStats')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
