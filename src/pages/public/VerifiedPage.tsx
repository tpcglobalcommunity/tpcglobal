import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/Accordion';
import { AlertTriangle } from 'lucide-react';

export function VerifiedPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
              {t('verified.title')}
            </h1>
            <p className="text-xl text-text-secondary">
              {t('verified.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <OfficialWalletsCard />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  {t('verified.warning')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  {t('verified.warningText')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('verified.antiScamFaq.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion collapsible className="w-full">
                {t('verified.antiScamFaq.items').map((item: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
