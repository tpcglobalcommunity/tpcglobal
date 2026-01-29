import { paymentWallets, transparencyWallets } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';
import { WalletCard } from './WalletCard';
import { AlertTriangle } from 'lucide-react';

export function OfficialWalletsCard() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gold mb-2">
          {t('verified.transparencyWallets')}
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto">
          {t('verified.subtitle')}
        </p>
      </div>

      {/* Payment Wallet Section */}
      {paymentWallets && paymentWallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gold">
              {t('verified.paymentWallet')}
            </h2>
            <div className="h-px flex-1 bg-white/10 ml-4"></div>
          </div>
          <div className="space-y-4">
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
        </div>
      )}

      {/* Transparency Wallets Section */}
      {transparencyWallets && transparencyWallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {t('verified.transparencyWallets')}
            </h2>
            <div className="h-px flex-1 bg-white/10 ml-4"></div>
          </div>
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

      {/* Important Warning - Single Block Only */}
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-warning mb-3">
              {t('verified.warning')}
            </h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Admin tidak pernah DM duluan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Jangan pernah bagikan seed phrase atau private key</span>
              </li>
              <li className="flex-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Hanya gunakan wallet yang tercantum di halaman ini</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
