import { useState } from 'react';
import { Mail, RefreshCw, Home } from 'lucide-react';
import { Language, useI18n } from '@/i18n';
import { PremiumCard, PremiumButton } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface VerificationRequiredProps {
  lang: Language;
}

const VerificationRequired = ({ lang }: VerificationRequiredProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const tr = (key: string, fallback: string) => {
    try {
      const v: any = (t as any)(key);
      if (!v || v === key) return fallback;
      return String(v);
    } catch {
      return fallback;
    }
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: (await supabase.auth.getUser()).data.user?.email || '',
      });

      if (error) {
        setMessage(tr("verificationRequired.resendError", "Failed to resend verification email. Please check your email or try again later."));
      } else {
        setMessage(tr("verificationRequired.resendSuccess", "Verification email sent! Please check your inbox."));
      }
    } catch (err) {
      setMessage(tr("verificationRequired.resendError", "Failed to resend verification email. Please check your email or try again later."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <PremiumCard className="p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {tr("verificationRequired.title", "Email Verification Required")}
            </h1>
            <p className="text-white/70 text-lg">
              {tr("verificationRequired.subtitle", "Please verify your email to continue")}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/20">
            <p className="text-white/80 text-sm leading-relaxed">
              {tr("verificationRequired.description", "We've sent a verification email to your registered email address. Please check your inbox and click the verification link to activate your account.")}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`w-full p-3 rounded-lg text-sm ${
              message.includes('sent') 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <PremiumButton
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {tr("verificationRequired.sending", "Sending...")}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  {tr("verificationRequired.resendEmail", "Resend Verification Email")}
                </>
              )}
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              onClick={() => navigate(`/${lang}`)}
              className="w-full"
            >
              <Home className="w-4 h-4" />
              {tr("verificationRequired.backToHome", "Back to Home")}
            </PremiumButton>
          </div>

          {/* Help */}
          <div className="text-center">
            <p className="text-white/50 text-sm">
              {tr("verificationRequired.help", "If you don't see the email, check your spam folder or contact support.")}
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default VerificationRequired;
