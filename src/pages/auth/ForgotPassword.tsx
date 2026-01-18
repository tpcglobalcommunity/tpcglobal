import { useState, FormEvent } from 'react';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumButton } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordProps {
  lang: Language;
}

const ForgotPassword = ({ lang }: ForgotPasswordProps) => {
  const t = useTranslations(lang);
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t.auth.errors.generic);
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/${lang}/reset`;
      const { error: resetError } = await sendPasswordReset(email, redirectTo);

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(t.auth.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <PremiumShell>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {t.auth.forgot.sentTitle}
            </h1>
            <p className="text-white/70 mb-8">
              {t.auth.forgot.sentDesc}
            </p>
            <a href={`/${lang}/signin`}>
              <PremiumButton className="w-full">
                {t.auth.signup.signInLink}
              </PremiumButton>
            </a>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-4">
              <Mail className="w-8 h-8 text-[#F0B90B]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.auth.forgot.title}
            </h1>
            <p className="text-white/70">
              {t.auth.forgot.subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.forgot.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.signin.emailPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <PremiumButton
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? t.auth.forgot.sending : t.auth.forgot.send}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <a
              href={`/${lang}/signin`}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              {t.auth.common.backHome}
            </a>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default ForgotPassword;
