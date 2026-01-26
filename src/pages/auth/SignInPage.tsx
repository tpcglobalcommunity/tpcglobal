import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link, useNavigate } from "@/components/Router";
import { supabase } from "@/lib/supabase";

interface SignInPageProps {
  lang: string;
}

// Safe translation helper with fallback
const tt = (t: (key: string) => string, key: string, fallback: string) => {
  const value = t(key);
  return (!value || value === key) ? fallback : value;
};

const SignInPage = ({ lang }: SignInPageProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          navigate(getLangPath(lang as any, "/member/dashboard"));
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };
    
    checkSession();
  }, [lang, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError(tt(t, "auth.signin.errorTitle", "Login failed"));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });

      if (error) {
        let errorMessage = tt(t, "auth.signin.errorTitle", "Login failed");
        
        if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email first";
        }
        
        setError(errorMessage);
        return;
      }

      if (data.user) {
        // Successful login, redirect to dashboard
        navigate(getLangPath(lang as any, "/member/dashboard"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(tt(t, "auth.signin.errorTitle", "Login failed"));
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
              <Shield className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {tt(t, "auth.signin.title", "Sign In")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {tt(t, "auth.signin.title", "Sign In")}
            </h1>
            
            <p className="text-white/70 leading-relaxed">
              {tt(t, "auth.signin.subtitle", "Log in securely to access the member area.")}
            </p>
          </div>

          {/* Login Form */}
          <PremiumCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  {tt(t, "auth.signin.emailLabel", "Email")}
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
                    placeholder={tt(t, "auth.signin.emailPlaceholder", "name@example.com")}
                    className="w-full pl-10 pr-3 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  {tt(t, "auth.signin.passwordLabel", "Password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder={tt(t, "auth.signin.passwordPlaceholder", "Enter your password")}
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
                    {tt(t, "auth.signin.loading", "Signing in...")}
                  </>
                ) : (
                  tt(t, "auth.signin.submit", "Sign In")
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
                    {tt(t, "auth.signin.securityTitle", "Security Notice")}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tt(t, "auth.signin.securityTitle", "Security Notice")}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed">
                  {tt(t, "auth.signin.securityDesc", "Never share your password. TPC will never ask for your credentials outside this site.")}
                </p>
              </div>
            </PremiumCard>
          </div>

          {/* Secondary Actions */}
          <div className="text-center mt-6 space-y-4">
            <div className="text-sm text-white/60">
              <Link to={getLangPath(lang as any, "/forgot-password")} className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors">
                {tt(t, "auth.forgot.forgot", "Forgot password?")}
              </Link>
            </div>
            
            <div className="text-sm text-white/60">
              <span>{tt(t, "member.login.createAccount", "Create account")}</span>
              {" "}
              <Link to={getLangPath(lang as any, "/signup")} className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors">
                →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default SignInPage;
