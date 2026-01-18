import { useState, FormEvent, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, NoticeBox, PremiumButton } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { validateReferralCode } from '../../lib/supabase';
import { validateUsername, mapAuthError } from '../../lib/authHelpers';

interface SignUpProps {
  lang: Language;
}

const SignUp = ({ lang }: SignUpProps) => {
  const t = useTranslations(lang);
  const { signUpInviteOnly, session } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    referralCode: '',
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (session && !checkEmail) {
      window.location.href = `/${lang}/member/dashboard`;
    }
  }, [session, lang, checkEmail]);

  const handleReferralBlur = async () => {
    if (!formData.referralCode.trim()) {
      setReferralValid(null);
      return;
    }

    setIsValidating(true);
    setError(null);

    const isValid = await validateReferralCode(formData.referralCode.trim());
    setReferralValid(isValid);

    if (!isValid) {
      setError(t.auth.signup.referralInvalid);
    }

    setIsValidating(false);
  };

  const handleUsernameBlur = () => {
    if (!formData.username.trim()) {
      setUsernameError(null);
      return;
    }

    const validation = validateUsername(formData.username);
    if (!validation.valid) {
      setUsernameError(validation.error || t.auth.signup.usernameRules);
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password || !formData.fullName || !formData.username || !formData.referralCode) {
      setError(t.auth.errors.generic);
      return;
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || t.auth.signup.usernameRules);
      return;
    }

    if (referralValid === false) {
      setError(t.auth.signup.referralInvalid);
      return;
    }

    setIsValidating(true);
    const isValid = await validateReferralCode(formData.referralCode.trim());
    setIsValidating(false);

    if (!isValid) {
      setError(t.auth.signup.referralInvalid);
      setReferralValid(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: authError, session: newSession } = await signUpInviteOnly({
        referralCode: formData.referralCode.trim().toUpperCase(),
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
      });

      if (authError) {
        throw authError;
      }

      if (newSession) {
        window.location.href = `/${lang}/member/dashboard`;
      } else {
        setCheckEmail(true);
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorMessage = mapAuthError(err, lang);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <PremiumShell>
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {t.auth.signup.checkEmailTitle}
            </h1>
            <p className="text-white/70 mb-8">
              {t.auth.signup.checkEmailDesc}
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
              <UserPlus className="w-8 h-8 text-[#F0B90B]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t.auth.signup.title}
            </h1>
            <p className="text-white/70">
              {t.auth.signup.subtitle}
            </p>
          </div>

          <NoticeBox variant="info" title={t.auth.signup.inviteNoticeTitle} className="mb-6">
            {t.auth.signup.inviteNoticeDesc}
          </NoticeBox>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signup.referralLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => {
                    setFormData({ ...formData, referralCode: e.target.value.toUpperCase() });
                    setReferralValid(null);
                    setError(null);
                  }}
                  onBlur={handleReferralBlur}
                  placeholder={t.auth.signup.referralPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
                  </div>
                )}
                {!isValidating && referralValid === true && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
                {!isValidating && referralValid === false && (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400" />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signup.emailLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.auth.signup.emailPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signup.passwordLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t.auth.signup.passwordPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signup.fullNameLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t.auth.signup.fullNamePlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
                {t.auth.signup.usernameLabel} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value.toLowerCase() });
                    setUsernameError(null);
                  }}
                  onBlur={handleUsernameBlur}
                  placeholder={t.auth.signup.usernamePlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:ring-2 focus:ring-[#F0B90B]/20 transition-all"
                  required
                  pattern="[a-z0-9_.]+"
                  disabled={isSubmitting}
                />
              </div>
              {usernameError && (
                <p className="text-red-400 text-xs mt-1">{usernameError}</p>
              )}
              <p className="text-white/50 text-xs mt-1">{t.auth.signup.usernameRules}</p>
            </div>

            <PremiumButton
              variant="primary"
              type="submit"
              disabled={isSubmitting || isValidating || referralValid === false || !!usernameError}
              className="w-full"
            >
              {isSubmitting ? t.auth.signup.submitting : t.auth.signup.submitButton}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              {t.auth.signup.haveAccount}{' '}
              <a
                href={`/${lang}/signin`}
                className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors font-medium"
              >
                {t.auth.signup.signInLink}
              </a>
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default SignUp;
