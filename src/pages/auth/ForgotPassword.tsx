import { useState } from "react";
import { Mail, Shield, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link, useNavigate } from "@/components/Router";
import { supabase } from "@/lib/supabase";

interface ForgotPasswordProps {
  lang: string;
}

// Safe translation helper with fallback
const tt = (t: (key: string) => string, key: string, fallback: string) => {
  const value = t(key);
  return (!value || value === key) ? fallback : value;
};

const ForgotPassword = ({ lang }: ForgotPasswordProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!formData.email) {
      setError(tt(t, "auth.forgot.errorTitle", "Request failed"));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
        redirectTo: `${window.location.origin}/${lang}/reset-password`
      });

      if (error) {
        setError(tt(t, "auth.forgot.errorTitle", "Request failed"));
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(tt(t, "auth.forgot.errorTitle", "Request failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#C29409]/10 border border-[#F0B90B]/20 mb-6">
              <Mail className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {tt(t, "auth.forgot.title", "Forgot Password")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {tt(t, "auth.forgot.title", "Forgot Password")}
            </h1>
            
            <p className="text-white/70 leading-relaxed">
              {tt(t, "auth.forgot.subtitle", "Enter your email and we'll send a reset link.")}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-4">
                  {tt(t, "auth.forgot.successTitle", "Check your inbox")}
                </h2>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {tt(t, "auth.forgot.successDesc", "If an account exists for this email, a reset link has been sent.")}
                </p>
                
                <Link to={getLangPath(lang as any, "/signin")}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    {tt(t, "auth.forgot.backToSignin", "Back to Sign In")}
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          ) : (
            <>
              {/* Form */}
              <PremiumCard>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      {tt(t, "auth.forgot.emailLabel", "Email")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/40" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={tt(t, "auth.forgot.emailPlaceholder", "name@example.com")}
                        className="w-full pl-10 pr-3 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-red-400 font-medium">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <PremiumButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                        {tt(t, "auth.forgot.loading", "Sending...")}
                      </>
                    ) : (
                      tt(t, "auth.forgot.submit", "Send Reset Link")
                    )}
                  </PremiumButton>
                </form>
              </PremiumCard>

              {/* Security Notice */}
              <div className="mt-6">
                <PremiumCard>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">
                        Security Notice
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Security Notice
                    </h3>
                    
                    <p className="text-white/60 text-sm leading-relaxed">
                      Reset links expire after 24 hours for security. If you don't receive an email, check your spam folder or request a new link.
                    </p>
                  </div>
                </PremiumCard>
              </div>

              {/* Back to Sign In */}
              <div className="text-center mt-6">
                <Link to={getLangPath(lang as any, "/signin")} className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors text-sm">
                  <ArrowLeft className="inline-block w-4 h-4 mr-1" />
                  {tt(t, "auth.forgot.backToSignin", "Back to Sign In")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PremiumShell>
  );
};

export default ForgotPassword;
