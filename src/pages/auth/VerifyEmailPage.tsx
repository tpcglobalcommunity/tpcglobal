import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useI18n, type Language } from '@/i18n';
import AuthShell from '@/components/auth/AuthShell';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmailPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const tokenHash = searchParams.get('token_hash');

        if (!tokenHash) {
          throw new Error('Invalid verification link');
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup'
        });

        if (error) {
          throw error;
        }

        setSuccess(true);
      } catch (err: any) {
        setError(err?.message || t('auth.verify.error') || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, t]);

  const handleContinue = () => {
    navigate(`/${lang}/member`);
  };

  return (
    <AuthShell
      lang={lang}
      title={t('auth.verify.title') || 'Verify Email'}
      subtitle={t('auth.verify.subtitle') || 'Confirm your email address'}
    >
      <div className="text-center">
        {loading && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-[#F0B90B]" />
            <p className="text-white/70">
              {t('auth.verify.loading') || 'Verifying your email...'}
            </p>
          </div>
        )}

        {success && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('auth.verify.success') || 'Email Verified!'}
              </h3>
              <p className="text-white/70 mb-6">
                {t('auth.verify.successMessage') || 'Your email has been successfully verified. You can now access your account.'}
              </p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-[#F0B90B] text-black font-semibold py-3 px-6 rounded-xl hover:bg-[#F8D568] transition-colors"
            >
              {t('auth.verify.continue') || 'Continue to Dashboard'}
            </button>
          </div>
        )}

        {error && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('auth.verify.failed') || 'Verification Failed'}
              </h3>
              <p className="text-white/70 mb-6">
                {error}
              </p>
            </div>
            <button
              onClick={() => navigate(`/${lang}/auth/forgot-password`)}
              className="w-full bg-[#F0B90B] text-black font-semibold py-3 px-6 rounded-xl hover:bg-[#F8D568] transition-colors"
            >
              {t('auth.verify.requestNew') || 'Request New Verification'}
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
