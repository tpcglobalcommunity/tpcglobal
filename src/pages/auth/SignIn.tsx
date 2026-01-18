import { useState, FormEvent } from 'react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumButton } from '../../components/ui';
import { Link } from '../../components/Router';
import { supabase } from '../../lib/supabase';

interface SignInProps {
  lang: Language;
}

const SignIn = ({ lang }: SignInProps) => {
  const t = useTranslations(lang);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error(t.auth.signin.errorInvalid);
        }
        throw authError;
      }

      window.location.href = getLangPath(lang, '/member/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t.auth.signin.errorGeneric;
      setError(errorMessage);
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

          {error && (
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
                  disabled={isSubmitting}
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
              {isSubmitting ? t.auth.signin.submitting : t.auth.signin.submitButton}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {t.auth.signin.noAccount}{' '}
              <Link
                to={getLangPath(lang, '/signup')}
                className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors font-medium"
              >
                {t.auth.signin.signUpLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default SignIn;
