import { useState, useEffect } from 'react';
import { useI18n, type Language } from '../../i18n';
import { supabase } from '../../lib/supabase';
import { getAppSettings } from '../../lib/appSettings';
import { Link } from 'react-router-dom';
import { Shield, Activity, Users, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';

export default function TrustHubPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await getAppSettings(supabase);
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const maintenanceMode = settings?.maintenance_mode === true;
  const registrationsOpen = settings?.registrations_open !== false;

  if (loading) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/70">
            <Activity className="w-8 h-8 animate-spin mb-4" />
            <p>Loading system status...</p>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 py-10 pb-24 md:pb-28">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-6">
            <Shield className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">
              {t('trust.status') || 'System Status'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {t('trust.title') || 'TPC Global Trust Hub'}
          </h1>
          <p className="text-white/60 text-lg max-w-[60ch] mx-auto">
            {t('trust.subtitle') || 'Transparency and system status for the TPC Global community'}
          </p>
        </div>

        {/* System Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <PremiumCard className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                maintenanceMode ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {maintenanceMode ? (
                  <AlertCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('trust.maintenance.title') || 'System Maintenance'}
                </h3>
                <p className="text-white/70 mb-3">
                  {maintenanceMode 
                    ? (t('trust.maintenance.active') || 'System is currently under maintenance')
                    : (t('trust.maintenance.inactive') || 'System is operating normally')
                  }
                </p>
                {maintenanceMode && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 text-sm">
                      {t('trust.maintenance.notice') || 'Some features may be temporarily unavailable. We apologize for the inconvenience.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                registrationsOpen ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                <Users className={`w-6 h-6 ${registrationsOpen ? 'text-green-400' : 'text-yellow-400'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('trust.registrations.title') || 'New Registrations'}
                </h3>
                <p className="text-white/70 mb-3">
                  {registrationsOpen 
                    ? (t('trust.registrations.open') || 'Registrations are currently open')
                    : (t('trust.registrations.closed') || 'Registrations are temporarily closed')
                  }
                </p>
                {!registrationsOpen && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      {t('trust.registrations.notice') || 'New registrations are temporarily paused. Check back later for updates.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Transparency Links */}
        <PremiumCard className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            {t('trust.transparency.title') || 'Transparency & Information'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('trust.transparency.links') || 'Important Links'}
              </h3>
              <div className="space-y-3">
                <Link 
                  to={`/${lang}/public/transparency`}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('trust.transparency.transparency') || 'Transparency Report'}</span>
                </Link>
                <Link 
                  to={`/${lang}/public/disclaimer`}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('trust.transparency.disclaimer') || 'Disclaimer'}</span>
                </Link>
                <Link 
                  to={`/${lang}/public/terms`}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('trust.transparency.terms') || 'Terms of Service'}</span>
                </Link>
                <Link 
                  to={`/${lang}/public/privacy`}
                  className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('trust.transparency.privacy') || 'Privacy Policy'}</span>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('trust.transparency.about') || 'About TPC Global'}
              </h3>
              <p className="text-white/70 mb-4">
                {t('trust.transparency.description') || 'TPC Global is committed to transparency and community trust. We provide regular updates on system status, financial operations, and governance decisions.'}
              </p>
              <div className="flex gap-3">
                <Link 
                  to={`/${lang}/public/about`}
                  className="text-[#F0B90B] hover:text-[#F8D568] transition-colors"
                >
                  {t('trust.transparency.learnMore') || 'Learn More'}
                </Link>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Call to Action */}
        <div className="text-center">
          {registrationsOpen && !maintenanceMode ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                {t('trust.cta.title') || 'Ready to Join TPC Global?'}
              </h2>
              <p className="text-white/70 max-w-[60ch] mx-auto">
                {t('trust.cta.subtitle') || 'Become part of our exclusive community and start your journey today.'}
              </p>
              <Link to={`/${lang}/auth/signup`}>
                <PremiumButton className="px-8 py-3">
                  {t('trust.cta.signup') || 'Sign Up Now'}
                </PremiumButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                {t('trust.cta.stayTuned') || 'Stay Tuned'}
              </h2>
              <p className="text-white/70 max-w-[60ch] mx-auto">
                {maintenanceMode 
                  ? (t('trust.cta.maintenanceMessage') || 'We\'re working hard to improve the system. Check back soon for updates.')
                  : (t('trust.cta.registrationsClosedMessage') || 'Registrations will open soon. Follow our updates for the latest news.')
                }
              </p>
              <div className="flex justify-center gap-4">
                <Link to={`/${lang}/public/transparency`}>
                  <PremiumButton variant="secondary">
                    {t('trust.cta.viewStatus') || 'View Full Status'}
                  </PremiumButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PremiumShell>
  );
}
