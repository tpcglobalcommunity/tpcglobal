import { useState } from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { withLang } from '../../i18n/i18n';
import { PRIMARY_SITE_URL } from '../../config/site';

interface AntiScamBannerProps {
  showReportScam?: boolean;
}

export function AntiScamBanner({ showReportScam = true }: AntiScamBannerProps) {
  const { t, lang } = useI18n();
  const [showReportModal, setShowReportModal] = useState(false);

  const isOfficialDomain = typeof window !== 'undefined' && 
    (window.location.origin === PRIMARY_SITE_URL || 
     window.location.hostname === 'localhost');

  const handleReportScam = () => {
    setShowReportModal(true);
  };

  const ReportScamModal = () => {
    if (!showReportModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-white/20 rounded-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('antiScam.banner.reportScam')}
            </h3>
            <div className="space-y-4 text-sm text-white/80">
              <p>If you encounter a scam or suspicious activity:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Take screenshots of the conversation</li>
                <li>Save wallet addresses used by scammers</li>
                <li>Report to our official channels</li>
                <li>Never share personal information</li>
              </ul>
              <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                <p className="text-xs text-warning">
                  Remember: TPC Global will never DM you first or ask for seed phrases.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1">
                Close
              </Button>
              <Button 
                variant="gold" 
                onClick={() => window.open('mailto:support@tpcglobal.io', '_blank')}
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main Banner */}
      <div className={`border-b ${isOfficialDomain ? 'border-warning/30 bg-warning/5' : 'border-danger/30 bg-danger/10'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${isOfficialDomain ? 'text-warning' : 'text-danger'}`} />
              <span className={`text-sm font-medium ${isOfficialDomain ? 'text-warning' : 'text-danger'}`}>
                {t('antiScam.banner.title')}
              </span>
              {!isOfficialDomain && (
                <span className="text-xs text-danger bg-danger/20 px-2 py-1 rounded">
                  {t('antiScam.domainLock.suspicious')}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={isOfficialDomain ? "outline" : "gold"}
                onClick={() => window.open(withLang('/verified', lang), '_blank')}
                className={`border ${isOfficialDomain ? 'border-warning text-warning hover:bg-warning hover:text-black' : 'border-danger text-danger hover:bg-danger hover:text-white'}`}
              >
                {t('antiScam.banner.verifiedWallets')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(withLang('/how-to-buy-safely', lang), '_blank')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {t('antiScam.banner.howToBuySafely')}
              </Button>
              {showReportScam && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReportScam}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {t('antiScam.banner.reportScam')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Scam Modal */}
      <ReportScamModal />
    </>
  );
}
