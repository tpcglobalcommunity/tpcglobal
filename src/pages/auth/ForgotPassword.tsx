import { useState, FormEvent } from 'react';
import { Mail, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumSection, PremiumButton } from '../../components/ui';
import { Link } from '../../components/Router';
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
        <PremiumSection className="pt-10 md:pt-14 pb-32">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F0B90B]/5 via-transparent to-transparent" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F0B90B]/8 rounded-full blur-[120px] opacity-30" />
          </div>

          <div className="relative max-w-md lg:max-w-lg mx-auto px-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden p-6 md:p-8">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent" />

              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 grid place-items-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {t.auth.forgot.sentTitle}
                </h1>
                <p className="text-white/65 mb-8 leading-relaxed">
                  {t.auth.forgot.sentDesc}
                </p>
                <Link to={getLangPath(lang, '/signin')}>
                  <PremiumButton className="w-full h-12">
                    {t.auth.signup.signInLink}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <PremiumSection className="pt-10 md:pt-14 pb-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F0B90B]/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F0B90B]/8 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="relative max-w-md lg:max-w-lg mx-auto px-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
              <Mail className="w-7 h-7 text-[#F0B90B] relative z-10" />
            </div>
            <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-tight">
              {t.auth.forgot.title}
            </h1>
            <p className="mt-3 text-white/65 text-sm md:text-base max-w-[42ch] mx-auto">
              {t.auth.forgot.subtitle}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent" />

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2.5">
                  {t.auth.forgot.email}
                </label>
                <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-2 focus-within:ring-[#F0B90B]/10 transition-all">
                  <Mail className="w-4 h-4 text-white/55 shrink-0" />
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

              <PremiumButton
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12"
              >
                {isSubmitting ? t.auth.forgot.sending : t.auth.forgot.send}
                <ArrowRight className="w-4 h-4 ml-2" />
              </PremiumButton>

              <div className="text-center text-sm text-white/65 pt-2">
                <Link to={getLangPath(lang, '/signin')} className="text-[#F0B90B] hover:underline font-medium">
                  {t.auth.common.backHome}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default ForgotPassword;
