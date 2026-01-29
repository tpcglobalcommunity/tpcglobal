import { paymentWallets, transparencyWallets } from '../../config/tpcWallets';
import { useI18n } from '../../hooks/useI18n';
import { WalletCard } from './WalletCard';

export function OfficialWalletsCard() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gold mb-2">
          {t('verified.transparencyWallets')}
        </h2>
        <p className="text-white/60">
          {t('verified.subtitle')}
        </p>
      </div>

      {/* Payment Wallet Section */}
      {paymentWallets && paymentWallets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gold">
              {t('verified.paymentWallet')}
            </h3>
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
            <h3 className="text-lg font-semibold text-white">
              {t('verified.transparencyWallets')}
            </h3>
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
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 3.161-3.111l.826-1.666c.27-.55.44-1.19.44-1.889 0-1.66-.54-3.112-1.621-3.112-3.111V7.917c0-1.669.54-3.112 1.621-3.112 3.111z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-warning mb-3">
              {t('verified.warning')}
            </h4>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Admin tidak pernah DM duluan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Jangan pernah bagikan seed phrase atau private key</span>
              </li>
              <li className="flex items-start gap-2">
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
