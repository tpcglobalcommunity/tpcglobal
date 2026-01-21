import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, ExternalLink, Users, RefreshCw } from 'lucide-react';
import { PremiumShell } from '../../components/ui/PremiumShell';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { supabase } from '../../lib/supabase';

export default function CheckEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const referralCode = searchParams.get('ref') || '';
  const [isGmailLoading, setIsGmailLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Auto-redirect jika tidak ada email
    if (!email) {
      navigate('/signin');
    }
  }, [email, navigate]);

  const resendConfirmationEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendStatus('idle');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        setResendStatus('error');
      } else {
        setResendStatus('success');
      }
    } catch (err) {
      setResendStatus('error');
    } finally {
      setTimeout(() => {
        setIsResending(false);
      }, 2000);
    }
  };

  const openGmail = () => {
    setIsGmailLoading(true);
    const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank');
    setTimeout(() => setIsGmailLoading(false), 1000);
  };

  const openEmailClient = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md mx-4">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Account Created
            </h1>
            <p className="text-gray-600 text-lg">
              We sent a confirmation email to:
            </p>
          </div>

          {/* Email Display Card */}
          <PremiumCard className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-mono text-lg break-all">
                {email}
              </p>
            </div>

            {/* Referral Message */}
            {referralCode && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-700">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Referral recorded automatically after confirmation.
                  </span>
                </div>
              </div>
            )}

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <span className="font-medium">Note:</span> If you don't see it, check Spam/Promotions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Resend Confirmation Button */}
              <button
                onClick={resendConfirmationEmail}
                disabled={isResending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : 'Resend Confirmation Email'}
              </button>

              {/* Status Message */}
              {resendStatus !== 'idle' && (
                <div className={`p-3 rounded-lg text-sm ${
                  resendStatus === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {resendStatus === 'success' 
                    ? '✅ Confirmation email resent successfully!' 
                    : '❌ Failed to resend email. Please try again.'
                  }
                </div>
              )}

              <button
                onClick={openGmail}
                disabled={isGmailLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                {isGmailLoading ? 'Opening Gmail...' : 'Open Gmail'}
              </button>

              <button
                onClick={openEmailClient}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Open Email Client
              </button>

              <button
                onClick={() => navigate('/signin')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
