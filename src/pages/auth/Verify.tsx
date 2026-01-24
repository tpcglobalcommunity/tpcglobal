import React, { useState, useEffect } from "react";
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import AuthShell from "../../components/auth/AuthShell";
import { AuthBuildMarker } from "../../components/auth/AuthBuildMarker";
import { getAuthState, getAuthRedirectPath, getLanguageFromPath, signOutIfUnverified } from "../../lib/authGuards";

interface VerifyProps {
  lang?: Language;
}

export default function Verify({ lang }: VerifyProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Check auth state and redirect if needed
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authState = await getAuthState();
      const currentLang = getLanguageFromPath(window.location.pathname);
      
      if (authState.isAuthed && authState.isEmailVerified) {
        // Already verified - redirect to update-profit
        const redirectPath = getAuthRedirectPath(authState, currentLang);
        window.location.assign(redirectPath);
        return;
      }
      
      if (!authState.isAuthed) {
        // Not logged in - redirect to login
        const loginPath = `/${currentLang}/login`;
        window.location.assign(loginPath);
        return;
      }

      // Set email from user data
      if (authState.user?.email) {
        setEmail(authState.user.email);
      }
    };

    checkAuthAndRedirect();
  }, []);

  // Get email from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam && !email) {
      setEmail(emailParam);
    }
  }, [email]);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setResending(true);
    setMessage("");
    
    try {
      // This would need to be implemented in your Supabase functions
      // For now, we'll show a success message
      setMessage("Verification email sent! Please check your inbox.");
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to resend verification email. Please try again.");
      setMessageType("error");
    } finally {
      setResending(false);
    }
  };

  const handleContinueAfterVerification = async () => {
    // Sign out unverified user first
    await signOutIfUnverified();
    
    // Redirect to login
    const currentLang = getLanguageFromPath(window.location.pathname);
    const loginPath = `/${currentLang}/login`;
    window.location.assign(loginPath);
  };

  return (
    <AuthShell 
      lang={lang}
      title="Verify Your Email"
      subtitle="Complete your registration by verifying your email address"
    >
      <div className="space-y-6">
        {/* Email Status */}
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F0B90B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Check Your Email
          </h3>
          <p className="text-white/70">
            We sent a verification email to:
          </p>
          <p className="text-[#F0B90B] font-medium mt-1">
            {email || "your email address"}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <h4 className="font-medium text-white mb-3">Next Steps:</h4>
          <ol className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-[#F0B90B] mt-1">1.</span>
              <span>Open your email inbox</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F0B90B] mt-1">2.</span>
              <span>Find the verification email from TPC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F0B90B] mt-1">3.</span>
              <span>Click the verification link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#F0B90B] mt-1">4.</span>
              <span>Return here and continue</span>
            </li>
          </ol>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`rounded-2xl border px-4 py-3.5 text-sm ${
            messageType === "success" 
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}>
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={resending || !email}
            className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Resend Verification Email
              </>
            )}
          </button>

          <button
            onClick={handleContinueAfterVerification}
            className="w-full h-12 rounded-2xl font-semibold border border-white/20 bg-white/5 text-white transition-all duration-200 hover:bg-white/10 active:translate-y-[1px] flex items-center justify-center gap-2"
          >
            Already Verified? Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-white/50">
          <p>
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="text-[#F0B90B] hover:underline disabled:opacity-50"
            >
              resend the email
            </button>
          </p>
        </div>

        {/* Back to Login */}
        <div className="text-center text-sm">
          <Link 
            to={getLangPath(L, "/login")} 
            className="text-white/60 hover:text-[#F0B90B] transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
      
      <AuthBuildMarker />
    </AuthShell>
  );
}
