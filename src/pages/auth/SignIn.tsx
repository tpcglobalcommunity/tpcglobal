import { useState, FormEvent, useEffect } from 'react';
import { LogIn, Mail, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumButton } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { checkRateLimit, recordAttempt, resetRateLimit, safeRedirect, mapAuthError } from '../../lib/authHelpers';

interface SignInProps {
  lang: Language;
}

const SignIn = ({ lang }: SignInProps) => {
  const t = useTranslations(lang);
  const { signIn, session } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (session) {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      const redirectPath = safeRedirect(next, lang);
      window.location.href = redirectPath;
    }
  }, [session, lang]);

  useEffect(() => {
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setIsLocked(true);
      setError(t.auth.signin.lockedDesc);
    }
  }, [t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setIsLocked(true);
      setError(t.auth.signin.lockedDesc);
      return;
    }

    if (!formData.email || !formData.password) {
      setError(t.auth.errors.generic);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: authError, session: newSession } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        recordAttempt();
        throw authError;
      }

      if (newSession) {
        resetRateLimit();
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next');
        const redirectPath = safeRedirect(next, lang);
        window.location.href = redirectPath;
      }
    } catch (err: unknown) {
      const errorMessage = mapAuthError(err, lang);
      setError(errorMessage);

      const updatedRateLimit = checkRateLimit();
      if (!updatedRateLimit.allowed) {
        setIsLocked(true);
        setError(t.auth.signin.lockedDesc);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-4">
              <LogIn className="w-8 h-8 text-[#F0B90B]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.auth.signin.title}
            </h1>
            <p className="text-white/70">
              {t.auth.signin.subtitle}
            </p>
          </div>

          {isLocked && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-semibold mb-1">{t.auth.signin.lockedTitle}</p>
                <p className="text-red-400/80 text-xs">{t.auth.signin.lockedDesc}</p>
              </div>
            </div>
          )}

          {error && !isLocked && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signin.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.auth.signin.emailPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting || isLocked}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signin.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t.auth.signin.passwordPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting || isLocked}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a
                href={`/${lang}/forgot`}
                className="text-sm text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
              >
                {t.auth.signin.forgot}
              </a>
            </div>

            <PremiumButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full"
            >
              {isSubmitting ? t.auth.signin.submitting : t.auth.signin.submitButton}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {t.auth.signin.noAccount}{' '}
              <a
                href={`/${lang}/signup`}
                className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors font-medium"
              >
                {t.auth.signin.goSignup}
              </a>
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default SignIn;
