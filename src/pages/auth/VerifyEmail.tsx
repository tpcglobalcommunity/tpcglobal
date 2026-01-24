import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AuthShell from "../../components/auth/AuthShell";
import { AuthBuildMarker } from "../../components/auth/AuthBuildMarker";

interface VerifyEmailProps {
  lang?: Language;
}

export default function VerifyEmail({ lang }: VerifyEmailProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email] = useState(searchParams.get('email') || '');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendMessage(null);
    setResendSuccess(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        setResendMessage(t("verifyEmail.resendError", "Failed to resend verification email. Please try again."));
        setResendSuccess(false);
      } else {
        setResendMessage(t("verifyEmail.resendSuccess", "Verification email has been resent. Please check your inbox."));
        setResendSuccess(true);
      }
    } catch (err) {
      setResendMessage(t("verifyEmail.resendError", "Failed to resend verification email. Please try again."));
      setResendSuccess(false);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate(getLangPath(L, "/signin"));
  };

  return (
    <AuthShell lang={L}>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {t("auth.verifyEmail.title")}
          </h1>
          <p className="text-white/60 text-lg mb-2">
            {t("auth.verifyEmail.subtitle")}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-white/80 mb-4">
              {t("auth.verifyEmail.body")}
            </p>
            <p className="text-blue-300 text-sm mb-4">
              {t("auth.verifyEmail.info")}
            </p>
            <p className="text-white font-medium text-lg">{email}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-blue-300 font-semibold mb-2">
                {t("auth.verifyEmail.hint")}
              </h3>
            </div>

            {resendMessage && (
              <div className={`p-4 rounded-xl text-sm ${
                resendSuccess 
                  ? "bg-green-500/10 border border-green-500/20 text-green-300" 
                  : "bg-red-500/10 border border-red-500/20 text-red-300"
              }`}>
                {resendSuccess && <CheckCircle2 className="w-4 h-4 inline mr-2" />}
                {resendMessage}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t("auth.verifyEmail.resending", "Resending...")}
                  </>
                ) : (
                  t("auth.verifyEmail.resend")
                )}
              </button>

              <button
                onClick={handleBackToSignIn}
                className="w-full h-12 rounded-xl bg-[#F0B90B] text-black font-semibold hover:bg-[#F0B90B]/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("auth.verifyEmail.backToSignIn", "Back to Sign In")}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-white/40 text-sm">
          <p>{t("auth.verifyEmail.footer")}</p>
        </div>
      </div>

      <AuthBuildMarker lang={L} />
    </AuthShell>
  );
}
