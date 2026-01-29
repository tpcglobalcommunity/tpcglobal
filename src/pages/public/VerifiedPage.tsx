import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { paymentWallets, transparencyWallets, getExplorerUrl } from '../../config/tpcWallets';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/Accordion';
import { Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { WalletVerifyModal } from '../../components/security/WalletVerifyModal';

interface WalletCardProps {
  address: string;
  label: string;
  purpose: string;
  isPayment?: boolean;
}

function WalletCard({ address, label, purpose, isPayment = false }: WalletCardProps) {
  const { t } = useI18n();
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    address: string;
    label: string;
    purpose: string;
    isPayment: boolean;
  } | null>(null);

  const handleVerifyModal = () => {
    setVerifyModal({
      isOpen: true,
      address,
      label,
      purpose,
      isPayment,
    });
  };

  return (
    <>
      <div className={`rounded-2xl ${isPayment ? 'border-gold/40 bg-gold/5' : 'border-white/10 bg-white/5'} p-5 space-y-4`}>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Label + Badge */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{label}</h3>
            {isPayment && (
              <Badge variant="outline" className="text-xs border-gold text-gold flex-shrink-0">
                TERVERIFIKASI
              </Badge>
            )}
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifyModal}
              className="bg-transparent border border-white/15 text-white hover:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t('common.copy')}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(getExplorerUrl(address), '_blank')}
              className="text-white hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t('common.openExplorer')}</span>
            </Button>
          </div>
        </div>

        {/* Purpose */}
        <p className="text-sm text-white/60">{purpose}</p>
        
        {/* Fingerprint */}
        <div className="text-center">
          <code className="font-mono text-lg text-white tracking-wide block break-all">
            {address.slice(0, 6)}…{address.slice(-4)}
          </code>
        </div>
        
        {/* Full Address Pill */}
        <div className="flex justify-center">
          <code className="font-mono text-xs text-white/80 break-all bg-black/30 border border-white/10 rounded-lg px-3 py-2">
            {address}
          </code>
        </div>
      </div>

      {/* Wallet Verify Modal */}
      {verifyModal && (
        <WalletVerifyModal
          isOpen={verifyModal.isOpen}
          onClose={() => setVerifyModal(null)}
          address={verifyModal.address}
          label={verifyModal.label}
          purpose={verifyModal.purpose}
          explorerUrl={getExplorerUrl(verifyModal.address)}
          isPayment={verifyModal.isPayment}
        />
      )}
    </>
  );
}

export function VerifiedPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gold mb-4">
            {t('verified.title')}
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Gunakan hanya dompet resmi di bawah ini untuk menghindari penipuan.
          </p>
        </div>

        {/* Payment Wallet Section */}
        {paymentWallets && paymentWallets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gold mb-4">
              {t('verified.paymentWallet')}
            </h2>
            {paymentWallets.map((wallet) => (
              <WalletCard
                key={wallet.address}
                address={wallet.address}
                label={wallet.label}
                purpose={wallet.purpose}
                isPayment={true}
              />
            ))}
          </div>
        )}

        {/* Transparency Wallets Section */}
        {transparencyWallets && transparencyWallets.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              {t('verified.transparencyWallets')}
            </h2>
            <div className="space-y-4">
              {transparencyWallets.map((wallet) => (
                <WalletCard
                  key={wallet.address}
                  address={wallet.address}
                  label={wallet.label}
                  purpose={wallet.purpose}
                  isPayment={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Anti-Scam Warning */}
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-warning mb-3">
                Peringatan Penting
              </h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Admin tidak pernah DM duluan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Jangan pernah bagikan seed phrase/private key</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>Gunakan hanya dompet di halaman ini</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Anti-Penipuan */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            {t('verified.antiScamFaq.title')}
          </h2>
          <Accordion collapsible className="space-y-3">
            {t('verified.antiScamFaq.items').map((item: any, index: number) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
              >
                <AccordionTrigger className="flex justify-between items-center p-4 hover:bg-white/8 transition-colors">
                  <span className="text-white font-medium">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
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
