import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, ExternalLink } from 'lucide-react';
import { paymentWallets, transparencyWallets, getExplorerUrl } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';
import { WalletVerifyModal } from '../security/WalletVerifyModal';

export function OfficialWalletsCard() {
  const { t } = useI18n();
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    address: string;
    label: string;
    purpose: string;
    isPayment: boolean;
  } | null>(null);

  const handleVerifyModal = (wallet: any, isPayment: boolean = false) => {
    setVerifyModal({
      isOpen: true,
      address: wallet.address,
      label: wallet.label,
      purpose: wallet.purpose,
      isPayment,
    });
  };

  const WalletRow = ({ wallet, isPayment = false }: { wallet: any; isPayment?: boolean }) => {
    if (!wallet || !wallet.address) {
      return (
        <div className="p-4 border border-warning rounded-lg bg-warning/5">
          <p className="text-sm text-warning">
            Data wallet tidak tersedia
          </p>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg border ${isPayment ? 'border-gold/60 bg-gold/5' : 'border-white/10 bg-white/5'}`}>
        {/* ROW 1: Header + Actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Left: Label + Badges */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h4 className="font-semibold text-white truncate">{wallet.label || 'Unknown Wallet'}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isPayment && (
                <>
                  <Badge variant="gold" className="text-xs">
                    {t('verified.paymentWallet')}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-gold text-gold">
                    {t('verified.official')}
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleVerifyModal(wallet, isPayment)}
              className="border-white/20 bg-transparent hover:bg-white/10 text-white hover:text-white"
            >
              <Copy className="h-3 w-3 mr-1" />
              {t('common.copy')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(getExplorerUrl(wallet.address), '_blank')}
              className="hover:bg-white/10 text-white"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {t('common.openExplorer')}
            </Button>
          </div>
        </div>

        {/* ROW 2: Subtitle */}
        <p className="text-sm text-white/60 mb-3">{wallet.purpose || 'No purpose specified'}</p>
        
        {/* ROW 3: Address */}
        <div className="space-y-2">
          {/* Large Fingerprint */}
          <div className="text-center">
            <code className="font-mono text-base text-white block break-all">
              {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
            </code>
          </div>
          
          {/* Full Address */}
          <div className="flex justify-center">
            <code className="font-mono text-xs bg-black/30 border border-white/10 rounded px-2 py-1 break-all max-w-full">
              {wallet.address}
            </code>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-gold">{t('verified.transparencyWallets')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Wallet Section */}
        {paymentWallets && paymentWallets.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gold">
                {t('verified.paymentWallet')}
              </h3>
              <div className="h-px flex-1 bg-white/10 ml-4"></div>
            </div>
            <div className="space-y-3">
              {paymentWallets.map((wallet) => (
                <WalletRow key={wallet.address} wallet={wallet} isPayment={true} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 border border-warning rounded-lg bg-warning/5">
            <p className="text-sm text-warning">
              Data wallet pembayaran sedang dimuat...
            </p>
          </div>
        )}
        
        {/* Transparency Wallets Section */}
        {transparencyWallets && transparencyWallets.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('verified.transparencyWallets')}
              </h3>
              <div className="h-px flex-1 bg-white/10 ml-4"></div>
            </div>
            <div className="space-y-3">
              {transparencyWallets.map((wallet) => (
                <WalletRow key={wallet.address} wallet={wallet} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 border border-warning rounded-lg bg-warning/5">
            <p className="text-sm text-warning">
              Data wallet transparansi sedang dimuat...
            </p>
          </div>
        )}

        {/* Anti-Scam Warnings */}
        <div className="space-y-3">
          <div className="p-4 bg-warning/10 border border-warning rounded-lg">
            <p className="text-sm text-warning font-medium">
              {t('antiScam.walletGuard.neverDm')}
            </p>
          </div>
          <div className="p-4 bg-danger/10 border border-danger rounded-lg">
            <p className="text-sm text-danger font-medium">
              {t('antiScam.walletGuard.neverSeed')}
            </p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-warning/10 border border-warning rounded-lg">
          <p className="text-sm text-warning font-medium">
            {t('verified.warning')}
          </p>
          <p className="text-xs text-warning mt-1">
            {t('verified.warningText')}
          </p>
        </div>
      </CardContent>

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
    </Card>
  );
}
