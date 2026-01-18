import { useState, FormEvent } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumButton } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

interface ResetPasswordProps {
  lang: Language;
}

const ResetPassword = ({ lang }: ResetPasswordProps) => {
  const t = useTranslations(lang);
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError(t.auth.errors.generic);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t.auth.reset.errorMismatch);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(t.auth.errors.generic);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resetError } = await updatePassword(formData.newPassword);

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
              {t.auth.reset.successTitle}
            </h1>
            <p className="text-white/70 mb-8">
              {t.auth.reset.successDesc}
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
              <Lock className="w-8 h-8 text-[#F0B90B]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.auth.reset.title}
            </h1>
            <p className="text-white/70">
              {t.auth.reset.subtitle}
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
              <label htmlFor="newPassword" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.reset.newPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder={t.auth.signup.passwordPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.reset.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t.auth.reset.confirmPassword}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  minLength={6}
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
              {isSubmitting ? t.auth.reset.updating : t.auth.reset.update}
            </PremiumButton>
          </form>
        </div>
      </div>
    </PremiumShell>
  );
};

export default ResetPassword;
