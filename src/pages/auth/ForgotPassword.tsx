import { useState, FormEvent } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n, type Language } from '../../i18n';
import { Link } from '../../components/Router';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from '../../components/auth/AuthShell';
import { AuthBuildMarker } from '../../components/auth/AuthBuildMarker';

export default function ForgotPassword({ lang }: { lang?: Language }) {
  const { t } = useI18n(lang || "en");
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(t("auth.forgot.emailRequired") || "Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await sendPasswordReset(email.trim(), window.location.origin + `/${lang || "en"}/reset`);
      if (resetError) {
        setError(resetError.message || t("auth.forgot.errorGeneric") || "Failed to send reset link");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || t("auth.forgot.errorGeneric") || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthShell 
        lang={lang}
        title={t("auth.forgot.successTitle")}
      >
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {t("auth.forgot.successTitle")}
          </h3>
          <p className="text-white/70 mb-6">
            {t("auth.forgot.successBody")}
          </p>
          <Link 
            to={`/${lang || "en"}/signin`}
            className="inline-flex items-center gap-2 text-[#F0B90B] hover:underline underline-offset-4 font-medium"
          >
            ← {t("auth.forgot.backToSignIn") || "Back to sign in"}
          </Link>
        </div>
        <AuthBuildMarker />
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      lang={lang}
      title={t("auth.forgot.title")}
      subtitle={t("auth.forgot.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2.5">
            {t("auth.forgot.emailLabel")}
          </label>
          <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
            <Mail className="w-4 h-4 text-white/50 shrink-0" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.forgot.emailPlaceholder")}
              type="email"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Error Display */}
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ArrowRight className="w-4 h-4 animate-spin" />
              {t("auth.forgot.sending") || "Sending..."}
            </>
          ) : (
            <>
              {t("auth.forgot.submit") || "Send reset link"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Navigation */}
      <div className="text-center mt-6">
        <Link 
          to={`/${lang || "en"}/signin`}
          className="text-sm text-[#F0B90B] hover:underline underline-offset-4 transition-colors"
        >
          ← {t("auth.forgot.backToSignIn") || "Back to sign in"}
        </Link>
      </div>

      <AuthBuildMarker />
    </AuthShell>
  );
}
