import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function DaoHowItWorksPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {t('dao.howItWorks.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('dao.howItWorks.description')}
            </p>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>How DAO Governance Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {t('dao.howItWorks.steps').map((step: string, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-white">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <OfficialWalletsCard />
        </div>
      </div>
    </div>
  );
}
