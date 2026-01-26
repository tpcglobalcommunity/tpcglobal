import { useState, useEffect } from "react";
import { Lock, Shield, AlertTriangle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link, useNavigate } from "@/components/Router";
import { supabase } from "@/lib/supabase";

interface ResetPasswordProps {
  lang: string;
}

// Safe translation helper with fallback
const tt = (t: (key: string) => string, key: string, fallback: string) => {
  const value = t(key);
  return (!value || value === key) ? fallback : value;
};

const ResetPassword = ({ lang }: ResetPasswordProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Check if reset session is valid
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          setIsValid(false);
          setUserEmail("");
        } else {
          setIsValid(true);
          setUserEmail(session.user.email || "");
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsValid(false);
        setUserEmail("");
      }
    };
    
    checkSession();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError(tt(t, "auth.reset.errorTitle", "Update failed"));
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError(tt(t, "auth.reset.passwordTooShort", "Password must be at least 8 characters."));
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(tt(t, "auth.reset.passwordMismatch", "Passwords do not match."));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        setError(tt(t, "auth.reset.errorTitle", "Update failed"));
      } else {
        setSuccess(true);
        // Optional: Sign out user after password update
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(tt(t, "auth.reset.errorTitle", "Update failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    setTimeout(() => {
      navigate(getLangPath(lang as any, "/signin"));
    }, 2000);
  };

  // Invalid state
  if (!isValid) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full">
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    {tt(t, "auth.reset.invalidTitle", "Link invalid or expired")}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-4">
                  {tt(t, "auth.reset.invalidTitle", "Link invalid or expired")}
                </h2>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {tt(t, "auth.reset.invalidDesc", "Please request a new password reset link.")}
                </p>
                
                <Link to={getLangPath(lang as any, "/forgot-password")}>
                  <PremiumButton variant="primary" size="sm" className="w-full">
                    {tt(t, "auth.reset.requestNew", "Request new link")}
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          </div>
        </div>
      </PremiumShell>
    );
  }

  // Success state
  if (success) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full">
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-4">
                  {tt(t, "auth.reset.successTitle", "Password updated")}
                </h2>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {tt(t, "auth.reset.successDesc", "Your password has been updated. Please sign in again.")}
                </p>
                
                <Link to={getLangPath(lang as any, "/signin")}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    {tt(t, "auth.forgot.backToSignin", "Back to Sign In")}
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>
          </div>
        </div>
      </PremiumShell>
    );
  }

  // Form state
  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#C29409]/10 border border-[#F0B90B]/20 mb-6">
              <Lock className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {tt(t, "auth.reset.title", "Reset Password")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {tt(t, "auth.reset.title", "Reset Password")}
            </h1>
            
            <p className="text-white/70 leading-relaxed">
              {tt(t, "auth.reset.subtitle", "Set a new password for your account.")}
            </p>
            
            {userEmail && (
              <p className="text-white/50 text-sm mt-2">
                For: {userEmail}
              </p>
            )}
          </div>

          {/* Form */}
          <PremiumCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                  {tt(t, "auth.reset.newPasswordLabel", "New password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder={tt(t, "auth.reset.newPasswordPlaceholder", "Enter new password")}
                    className="w-full pl-10 pr-10 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/40 hover:text-white/60" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/40 hover:text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  {tt(t, "auth.reset.confirmPasswordLabel", "Confirm password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder={tt(t, "auth.reset.confirmPasswordPlaceholder", "Re-enter new password")}
                    className="w-full pl-10 pr-10 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-white/40 hover:text-white/60" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/40 hover:text-white/60" />
                    )}
                  </button>
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
                    {tt(t, "auth.reset.loading", "Updating...")}
                  </>
                ) : (
                  tt(t, "auth.reset.submit", "Update Password")
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
                  Make sure your new password is strong and unique. Avoid using passwords you've used elsewhere.
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
        </div>
      </div>
    </PremiumShell>
  );
};

export default ResetPassword;
