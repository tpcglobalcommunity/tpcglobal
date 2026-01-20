import { useState, FormEvent } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Link } from '../../components/Router';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const { t } = useI18n();
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t("auth.errors.generic"));
      return;
    }

    setIsSubmitting(true);

    try {
      const currentLang = window.location.pathname.split('/')[1] || 'en';
      const redirectTo = `${window.location.origin}/${currentLang}/reset`;
      const { error: resetError } = await sendPasswordReset(email, redirectTo);

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(t("auth.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md lg:max-w-lg mx-auto px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden p-5 sm:p-6">
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

          <div className="relative text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 grid place-items-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t.auth.forgot.sentTitle}
            </h1>
            <p className="text-white/65 mb-8 leading-relaxed">
              {t.auth.forgot.sentDesc}
            </p>
            <Link to="/signin">
              <button
                type="button"
                className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] flex items-center justify-center gap-2"
              >
                {t("auth.signup.signInLink")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md lg:max-w-lg mx-auto px-4">
      <div className="text-center mb-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
          <Mail className="w-7 h-7 text-[#F0B90B] relative z-10" />
        </div>
        <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-[1.06]">
          {t.auth.forgot.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65 max-w-[42ch] mx-auto">
          {t.auth.forgot.subtitle}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

        <form onSubmit={handleSubmit} className="relative p-5 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2.5">
              {t.auth.forgot.email}
            </label>
            <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
              <Mail className="w-4 h-4 text-white/50 shrink-0" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.signin.emailPlaceholder}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? t.auth.forgot.sending : t.auth.forgot.send}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-xs text-white/45 text-center mt-3">
            {t.auth.reassurance}
          </div>

          <div className="text-center text-sm text-white/60 pt-3">
            <Link to="/signin" className="text-[#F0B90B] hover:underline underline-offset-4 font-medium">
              {t("auth.common.backToSignIn")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
