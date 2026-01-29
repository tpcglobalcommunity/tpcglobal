import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, ExternalLink } from 'lucide-react';
import { paymentWallets, transparencyWallets, formatWalletAddress, getExplorerUrl } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';

export function OfficialWalletsCard() {
  const { t } = useI18n();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
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
      <div className={`p-4 rounded-lg border ${isPayment ? 'border-gold bg-gold/5' : 'border-white/20 bg-white/5'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-white">{wallet.label || 'Unknown Wallet'}</h4>
              {isPayment && (
                <Badge variant="gold" className="text-xs">
                  {t('verified.paymentWallet')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/60 mb-2">{wallet.purpose || 'No purpose specified'}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Full:</span>
                <code className="text-xs bg-black/30 px-2 py-1 rounded text-white/80 break-all">
                  {wallet.address}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Short:</span>
                <code className="text-xs bg-black/30 px-2 py-1 rounded text-mono text-white">
                  {formatWalletAddress(wallet.address)}
                </code>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={copiedAddress === wallet.address ? "gold" : "outline"}
              onClick={() => handleCopyAddress(wallet.address)}
              className="min-w-[100px]"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copiedAddress === wallet.address ? t('common.copied') : t('common.copy')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(getExplorerUrl(wallet.address), '_blank')}
              className="min-w-[100px]"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              {t('common.openExplorer')}
            </Button>
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
      <CardContent className="space-y-4">
        {/* Payment Wallet Section */}
        {paymentWallets && paymentWallets.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gold mb-3">
              {t('verified.paymentWallet')}
            </h3>
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
            <h3 className="text-lg font-semibold text-white mb-3">
              {t('verified.transparencyWallets')}
            </h3>
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

        {/* Debug Info for Development */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="mt-4 p-3 bg-surface/50 border border-border rounded-lg">
            <p className="text-xs text-text-secondary">
              Debug: {paymentWallets?.length || 0} payment wallets, {transparencyWallets?.length || 0} transparency wallets
            </p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-warning/10 border border-warning rounded-lg">
          <p className="text-sm text-warning font-medium">
            {t('verified.warning')}
          </p>
          <p className="text-xs text-warning mt-1">
            {t('verified.warningText')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
