import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, ExternalLink } from 'lucide-react';
import { paymentWallet, formatWalletAddress, getExplorerUrl } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';

export function AddressPreviewCard() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!paymentWallet) return;
    
    try {
      await navigator.clipboard.writeText(paymentWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (!paymentWallet) return null;

  return (
    <Card className="w-full border-gold bg-gold/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-gold">Official Payment Address</span>
          <Badge variant="gold" className="text-xs">
            VERIFIED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Full Address:</span>
              <Button
                size="sm"
                variant={copied ? "gold" : "outline"}
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3 mr-1" />
                {copied ? t('common.copied') : t('common.copy')}
              </Button>
            </div>
            <code className="block w-full p-3 bg-background rounded border border-border text-sm text-mono break-all">
              {paymentWallet.address}
            </code>
          </div>
          
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Short Format:</span>
              <span className="text-sm font-mono text-gold">
                {formatWalletAddress(paymentWallet.address)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => paymentWallet && window.open(getExplorerUrl(paymentWallet.address), '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('common.openExplorer')}
          </Button>
        </div>

        <div className="p-3 bg-warning/10 border border-warning rounded-lg">
          <p className="text-xs text-warning font-medium">
            ⚠️ Only send funds to this verified address
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
