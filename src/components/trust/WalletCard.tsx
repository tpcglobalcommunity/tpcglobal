import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Copy, ExternalLink } from 'lucide-react';
import { getExplorerUrl } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';
import { WalletVerifyModal } from '../security/WalletVerifyModal';

interface WalletCardProps {
  address: string;
  label: string;
  purpose: string;
  isPayment?: boolean;
}

export function WalletCard({ address, label, purpose, isPayment = false }: WalletCardProps) {
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
      <div className={`rounded-2xl border ${isPayment ? 'border-gold/40 bg-gold/5' : 'border-white/10 bg-white/5'} p-4 sm:p-5`}>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Left: Label + Badges */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{label}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isPayment && (
                <Badge variant="outline" className="text-xs border-gold text-gold">
                  {t('verified.official')}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifyModal}
              className="border-white/15 bg-transparent hover:bg-white/10 text-white hover:text-white"
            >
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t('common.copy')}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(getExplorerUrl(address), '_blank')}
              className="hover:bg-white/10 text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t('common.openExplorer')}</span>
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {/* Purpose */}
          <p className="text-sm text-white/60">{purpose}</p>
          
          {/* Address Fingerprint */}
          <div className="text-center">
            <code className="font-mono text-base sm:text-lg text-white tracking-wide block break-all">
              {address.slice(0, 6)}…{address.slice(-4)}
            </code>
          </div>
          
          {/* Full Address */}
          <div className="flex justify-center">
            <code className="font-mono text-xs text-white/80 break-all bg-black/30 border border-white/10 rounded-lg px-3 py-2">
              {address}
            </code>
          </div>
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
