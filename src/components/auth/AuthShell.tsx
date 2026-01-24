import { Shield } from 'lucide-react';
import { useI18n, type Language, getLangPath } from '../../i18n';
import { Link } from '../Router';
import { PremiumShell } from '../ui';
import type { ReactNode } from 'react';

interface AuthShellProps {
  lang?: Language;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  bottomSlot?: ReactNode;
}

export default function AuthShell({ 
  lang, 
  title, 
  subtitle, 
  children, 
  bottomSlot 
}: AuthShellProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4">
        <div className="max-w-md lg:max-w-lg mx-auto">
          {/* Header dengan Logo dan Tombol Keluar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border-[#F0B90B]/20 mb-6">
              <Shield className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t("auth.header.pill") || "Secure Access"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {title || "TPC Member Area"}
            </h1>
            <p className="text-lg text-white/70 max-w-[60ch] mx-auto leading-relaxed mb-6">
              {subtitle || "Welcome back to TPC"}
            </p>
            <button
              onClick={() => window.location.href = `/${L}`}
              className="absolute top-4 right-4 text-sm text-white/60 hover:text-white transition-colors"
            >
              {t("signup.backToHome") || "← Back to Home"}
            </button>
          </div>

          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

            {/* Form Container */}
            <div className="relative p-6 sm:p-8">
              {children}
            </div>
          </div>

          {/* Bottom Slot */}
          {bottomSlot && (
            <div className="mt-6 text-center">
              {bottomSlot}
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-white/45">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={getLangPath(L, "/terms")} className="text-white/60 hover:text-white transition-colors">
                {t("legal.terms") || "Terms"}
              </Link>
              <Link to={getLangPath(L, "/privacy")} className="text-white/60 hover:text-white transition-colors">
                {t("legal.privacy") || "Privacy"}
              </Link>
            </div>
            
            <div className="mt-4 text-xs text-white/30">
              {t("auth.reassurance") || "Your data is protected. We never share your information."}
            </div>
          </div>
        </div>
      </section>
    </PremiumShell>
  );
}
