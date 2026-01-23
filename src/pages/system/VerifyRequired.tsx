import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../../i18n";
import { Mail, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ensureLangPath } from "../../utils/langPath";

export default function VerifyRequired() {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        setMessage(error.message || "Failed to resend verification email");
      } else {
        setMessage("Verification email sent successfully!");
      }
    } catch (err: any) {
      setMessage(err?.message || "An error occurred");
    } finally {
      setIsResending(false);
    }
  };

  const openEmailClient = () => {
    const emailClients = [
      'https://mail.google.com',
      'https://outlook.live.com',
      'https://outlook.office.com',
      'https://mail.yahoo.com'
    ];

    // Try to detect email provider from email domain
    const domain = email.split('@')[1]?.toLowerCase();
    let clientUrl = emailClients[0]; // Default to Gmail

    if (domain?.includes('gmail')) {
      clientUrl = emailClients[0];
    } else if (domain?.includes('outlook') || domain?.includes('live') || domain?.includes('office')) {
      clientUrl = emailClients[1];
    } else if (domain?.includes('yahoo')) {
      clientUrl = emailClients[3];
    }

    window.open(clientUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-[#F0B90B]/5 via-transparent to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {t("verifyRequired.title")}
            </h1>
            <p className="text-white/60 text-lg">
              {t("verifyRequired.subtitle")}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                {t("verifyRequired.emailLabel")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("verifyRequired.emailPlaceholder")}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl text-sm ${
                message.includes("successfully") 
                  ? "bg-green-500/10 border border-green-500/20 text-green-300"
                  : "bg-red-500/10 border border-red-500/20 text-red-300"
              }`}>
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={openEmailClient}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold hover:from-[#F0B90B]/90 hover:to-[#F8D568]/90 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {t("verifyRequired.openEmail")}
              </button>
              
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {t("verifyRequired.resending")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {t("verifyRequired.resend")}
                  </>
                )}
              </button>
            </div>

            {/* Tips Accordion */}
            <div className="border-t border-white/10 pt-6">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full flex items-center justify-between text-white/70 hover:text-white transition-colors py-2"
              >
                <span className="text-sm font-medium">
                  {t("verifyRequired.emailTips")}
                </span>
                {showTips ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showTips && (
                <div className="mt-4 space-y-3 text-sm text-white/60">
                  <div className="flex items-start gap-2">
                    <span className="text-[#F0B90B]">•</span>
                    <span>{t("verifyRequired.tip1")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#F0B90B]">•</span>
                    <span>{t("verifyRequired.tip2")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#F0B90B]">•</span>
                    <span>{t("verifyRequired.tip3")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#F0B90B]">•</span>
                    <span>{t("verifyRequired.tip4")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <Link 
                to={ensureLangPath(lang, "/signin")}
                className="text-white/60 hover:text-white/80 text-sm transition-colors"
              >
                ← {t("verifyRequired.backToSignIn")}
              </Link>
            </div>
          </div>

          {/* Home Link */}
          <div className="text-center mt-6">
            <Link 
              to={ensureLangPath(lang, "/")}
              className="text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              ← {t("common.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
