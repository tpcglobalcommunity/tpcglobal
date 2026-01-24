import { ReactNode } from 'react';
import { useI18n, type Language } from '@/i18n';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { PremiumCard, PremiumButton } from '../ui';

interface EnvGuardProps {
  children: ReactNode;
  lang?: Language;
}

/**
 * Environment Guard Component
 * Prevents crashes when Supabase ENV is missing
 */
export default function EnvGuard({ children, lang = "en" }: EnvGuardProps) {
  const { t } = useI18n(lang);
  
  // Check environment variables safely
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isValid = supabaseUrl && 
                 supabaseAnonKey && 
                 typeof supabaseUrl === 'string' && 
                 typeof supabaseAnonKey === 'string' &&
                 supabaseUrl.startsWith('https://');
  
  const DEBUG = import.meta.env.DEV && typeof localStorage !== 'undefined' && localStorage.getItem("tpc_debug") === "1";
  
  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#F8D568] flex items-center justify-center mb-6 shadow-lg shadow-[#F0B90B]/20">
              <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TPC</span>
              </div>
            </div>
          </div>
          
          {/* Error Card */}
          <PremiumCard className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                {t('envGuard.title') || 'Konfigurasi Belum Siap'}
              </h1>
              
              <p className="text-white/70 mb-8">
                {t('envGuard.message') || 'Sistem sedang disiapkan. Silakan kembali beberapa saat lagi.'}
              </p>
              
              {/* Debug info (only when debug mode is ON) */}
              {DEBUG && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                  <p className="text-red-300 text-sm font-mono mb-2">
                    DEBUG INFO:
                  </p>
                  <div className="text-red-400 text-xs font-mono space-y-1">
                    <div>URL: {supabaseUrl ? 'OK' : 'MISSING'}</div>
                    <div>Key: {supabaseAnonKey ? 'OK' : 'MISSING'}</div>
                    <div>Valid: {isValid ? 'YES' : 'NO'}</div>
                  </div>
                </div>
              )}
              
              <Link to={`/${lang}/trust`}>
                <PremiumButton className="w-full flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  {t('envGuard.backToHome') || 'Kembali ke Beranda'}
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
