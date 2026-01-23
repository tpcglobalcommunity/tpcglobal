import { useState, useEffect, FormEvent } from 'react';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n, type Language } from '../../i18n';
import { Link } from '../../components/Router';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from '../../components/auth/AuthShell';
import { AuthBuildMarker } from '../../components/auth/AuthBuildMarker';

export default function ResetPassword({ lang }: { lang?: Language }) {
  const { t } = useI18n(lang || "en");
  const { updatePassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract token from URL
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim()) {
      setError(t("auth.reset.passwordRequired") || "New password is required");
      return;
    }

    if (newPassword.length < 8) {
      setError(t("auth.reset.passwordMinLength") || "Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.reset.passwordMismatch") || "Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        setError(updateError.message || t("auth.reset.errorGeneric") || "Failed to update password");
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || t("auth.reset.errorGeneric") || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell 
        lang={lang}
        title="Invalid Reset Link"
      >
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Link 
            to={`/${lang || "en"}/forgot`}
            className="inline-flex items-center gap-2 text-[#F0B90B] hover:underline underline-offset-4 font-medium"
          >
            ← Request new reset link
          </Link>
        </div>
        <AuthBuildMarker />
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell 
        lang={lang}
        title={t("auth.reset.successTitle")}
      >
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {t("auth.reset.successTitle")}
          </h3>
          <p className="text-white/70 mb-6">
            {t("auth.reset.successDesc")}
          </p>
          <Link 
            to={`/${lang || "en"}/signin`}
            className="inline-flex items-center gap-2 text-[#F0B90B] hover:underline underline-offset-4 font-medium"
          >
            {t("auth.reset.signIn") || "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <AuthBuildMarker />
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      lang={lang}
      title={t("auth.reset.title")}
      subtitle={t("auth.reset.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Field */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2.5">
            {t("auth.reset.newPassword")}
          </label>
          <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
            <Lock className="w-4 h-4 text-white/50 shrink-0" />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="•••••••••"
              type="password"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2.5">
            {t("auth.reset.confirmPassword")}
          </label>
          <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
            <Lock className="w-4 h-4 text-white/50 shrink-0" />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="•••••••••"
              type="password"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              autoComplete="new-password"
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
          disabled={isSubmitting || !newPassword.trim() || !confirmPassword.trim()}
          className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <ArrowRight className="w-4 h-4 animate-spin" />
              {t("auth.reset.updating") || "Updating..."}
            </>
          ) : (
            <>
              {t("auth.reset.update") || "Update Password"}
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
          ← {t("auth.common.backToSignIn") || "Back to sign in"}
        </Link>
      </div>

      <AuthBuildMarker />
    </AuthShell>
  );
}
