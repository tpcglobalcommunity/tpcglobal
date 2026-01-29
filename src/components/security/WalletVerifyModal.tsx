import { useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, ExternalLink, Shield, AlertTriangle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { PRIMARY_SITE_URL } from '../../config/site';

interface WalletVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  label: string;
  purpose: string;
  explorerUrl: string;
  isPayment?: boolean;
}

export function WalletVerifyModal({ 
  isOpen, 
  onClose, 
  address, 
  label, 
  purpose, 
  explorerUrl, 
  isPayment = false 
}: WalletVerifyModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCopy = async () => {
    if (isPayment && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowConfirm(false);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatShortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
  };

  const isOfficialDomain = typeof window !== 'undefined' && 
    (window.location.origin === PRIMARY_SITE_URL || 
     window.location.hostname === 'localhost');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-white/20 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-2 text-gold">
            <Shield className="h-5 w-5" />
            {t('antiScam.walletGuard.confirmTitle')}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Domain Lock */}
          <div className={`p-4 rounded-lg border ${isOfficialDomain ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isOfficialDomain ? (
                <Shield className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-danger" />
              )}
              <span className={`font-semibold ${isOfficialDomain ? 'text-success' : 'text-danger'}`}>
                {isOfficialDomain ? t('antiScam.domainLock.official') : t('antiScam.domainLock.warning')}
              </span>
            </div>
            {!isOfficialDomain && (
              <>
                <p className="text-sm text-danger mb-2">{t('antiScam.domainLock.suspicious')}</p>
                <p className="text-sm text-danger">{t('antiScam.domainLock.leaveImmediately')}</p>
              </>
            )}
          </div>

          {/* Address Display */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{label}</h4>
              {isPayment && (
                <Badge variant="gold" className="text-xs">
                  {t('verified.paymentWallet')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/60">{purpose}</p>
            
            {/* Large Short Address */}
            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-lg">
              <code className="text-2xl font-mono text-white break-all">
                {formatShortAddress(address)}
              </code>
            </div>
            
            {/* Full Address */}
            <div className="p-3 bg-black/30 border border-white/10 rounded-lg">
              <p className="text-xs text-white/60 mb-1">Full Address:</p>
              <code className="text-xs text-white/80 break-all font-mono">
                {address}
              </code>
            </div>

            <p className="text-xs text-white/60 italic">
              {t('antiScam.walletGuard.verifyByMatching')}
            </p>
          </div>

          {/* Confirm Modal for Payment Wallet */}
          {showConfirm && (
            <div className="p-4 bg-warning/10 border border-warning rounded-lg">
              <p className="text-sm text-warning mb-4">
                {t('antiScam.walletGuard.confirmMessage')}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1"
                >
                  {t('antiScam.walletGuard.cancel')}
                </Button>
                <Button 
                  variant="gold" 
                  size="sm" 
                  onClick={handleCopy}
                  className="flex-1"
                >
                  {t('antiScam.walletGuard.confirm')}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant={copied ? "gold" : "outline"}
              onClick={handleCopy}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? t('common.copied') : t('common.copy')}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(explorerUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('common.openExplorer')}
            </Button>
          </div>

          {/* Safety Checklist */}
          <div className="space-y-2">
            <h5 className="font-semibold text-white mb-3">Safety Checklist:</h5>
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" readOnly checked={isOfficialDomain} />
                <span className={isOfficialDomain ? 'text-white/80' : 'text-white/40'}>
                  {t('antiScam.checklist.officialDomain')}
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" readOnly checked={true} />
                <span className="text-white/80">
                  {t('antiScam.checklist.addressMatch')}
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" readOnly checked={true} />
                <span className="text-white/80">
                  {t('antiScam.checklist.noDm')}
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1" readOnly checked={true} />
                <span className="text-white/80">
                  {t('antiScam.checklist.noSeed')}
                </span>
              </label>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-3">
            <div className="p-3 bg-warning/10 border border-warning rounded-lg">
              <p className="text-sm text-warning font-medium">
                {t('antiScam.walletGuard.neverDm')}
              </p>
            </div>
            <div className="p-3 bg-danger/10 border border-danger rounded-lg">
              <p className="text-sm text-danger font-medium">
                {t('antiScam.walletGuard.neverSeed')}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
