import { useI18n } from '../../hooks/useI18n';
import { OfficialWalletsCard } from '../../components/trust/OfficialWalletsCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/Accordion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function VerifiedPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Global Anti-Scam Banner */}
      <div className="border-b border-warning/30 bg-warning/5">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">
                ⚠️ HANYA gunakan dompet resmi yang terverifikasi
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => document.getElementById('wallets')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-white border-white/15 hover:bg-white/10"
              >
                Lihat Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
            {t('verified.title')}
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {t('verified.subtitle')}
          </p>
        </div>

        {/* Wallet Cards */}
        <div id="wallets">
          <OfficialWalletsCard />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {t('verified.antiScamFaq.title')}
          </h2>
          <Accordion collapsible className="space-y-3">
            {t('verified.antiScamFaq.items').map((item: any, index: number) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <AccordionTrigger className="flex justify-between items-center p-4 sm:p-5 hover:bg-white/8 transition-colors">
                  <span className="text-white font-medium">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <p className="text-white/70 leading-relaxed">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
