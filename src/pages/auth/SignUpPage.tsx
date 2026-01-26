import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link, useNavigate } from "@/components/Router";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensureProfile";
import { validateReferralCodePublic } from "@/utils/referralValidationFixed";

interface SignUpPageProps {
  lang: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  acceptTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  referralCode?: string;
  acceptTerms?: string;
}

const SignUpPage = ({ lang }: SignUpPageProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("auth.signup.errors.required");
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t("auth.signup.errors.required");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("auth.signup.errors.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("auth.signup.errors.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("auth.signup.errors.required");
    } else if (formData.password.length < 8) {
      newErrors.password = t("auth.signup.errors.passwordMin");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.signup.errors.required");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("auth.signup.errors.passwordMatch");
    }

    if (!formData.acceptTerms) {
      newErrors.terms = t("auth.signup.errors.terms");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Validate referral code if provided
      let referralData = null;
      if (formData.referralCode.trim()) {
        try {
          const isValid = await validateReferralCodePublic(formData.referralCode.trim());
          if (isValid) {
            // Store referral code in user metadata
            referralData = formData.referralCode.trim().toUpperCase();
          }
        } catch (referralError) {
          console.warn("Referral validation failed:", referralError);
          // Continue without referral - don't fail signup
        }
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            referral_code: referralData,
          },
          emailRedirectTo: `${window.location.origin}/${lang}/check-email`
        }
      });

      if (error) {
        let errorMessage = t("auth.signup.errorGeneric");
        if (error.message.includes("email")) {
          errorMessage = t("auth.signup.errors.emailInvalid");
        } else if (error.message.includes("password")) {
          errorMessage = t("auth.signup.errors.passwordMin");
        } else if (error.message.includes("already registered")) {
          errorMessage = "Email already registered";
        }
        setSubmitError(errorMessage);
        return;
      }

      if (data.user && data.user.email_confirmed_at) {
        // Email already confirmed, create profile and redirect
        try {
          await ensureProfile(data.user);
          navigate(getLangPath(lang as any, "/signin"));
        } catch (profileError) {
          console.error("Profile creation error:", profileError);
          // Continue anyway - user can complete profile later
          navigate(getLangPath(lang as any, "/signin"));
        }
      } else {
        // Email confirmation required - redirect to check email page
        navigate(getLangPath(lang as any, "/check-email"));
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSubmitError(t("auth.signup.errorGeneric"));
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
              <User className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t("auth.signup.title")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t("auth.signup.title")}
            </h1>
            
            <p className="text-white/70 leading-relaxed">
              {t("auth.signup.subtitle")}
            </p>
          </div>

          {/* Form */}
          <PremiumCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                  {t("auth.signup.fullName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder={t("auth.signup.fullName")}
                    className={`w-full pl-10 pr-3 py-3 bg-white/[0.05] border ${
                      errors.fullName ? "border-red-500/50" : "border-white/10"
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all`}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  {t("auth.signup.email")}
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
                    placeholder={t("auth.signup.email")}
                    className={`w-full pl-10 pr-3 py-3 bg-white/[0.05] border ${
                      errors.email ? "border-red-500/50" : "border-white/10"
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  {t("auth.signup.password")}
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
                    placeholder={t("auth.signup.password")}
                    className={`w-full pl-10 pr-10 py-3 bg-white/[0.05] border ${
                      errors.password ? "border-red-500/50" : "border-white/10"
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all`}
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
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  {t("auth.signup.confirmPassword")}
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
                    placeholder={t("auth.signup.confirmPassword")}
                    className={`w-full pl-10 pr-10 py-3 bg-white/[0.05] border ${
                      errors.confirmPassword ? "border-red-500/50" : "border-white/10"
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all`}
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Referral Code */}
              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-white mb-2">
                  {t("auth.signup.referral")}
                </label>
                <input
                  id="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange("referralCode", e.target.value)}
                  placeholder={t("auth.signup.referral")}
                  maxLength={32}
                  className="w-full px-3 py-3 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/20 focus:border-[#F0B90B]/50 transition-all"
                />
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                    className="mt-1 h-4 w-4 bg-white/[0.05] border border-white/20 rounded text-[#F0B90B] focus:ring-[#F0B90B]/20 focus:ring-offset-0 focus:ring-offset-transparent"
                  />
                  <span className="text-sm text-white/70 leading-relaxed">
                    {t("auth.signup.terms")}{" "}
                    <Link to={getLangPath(lang as any, "/legal")} className="text-[#F0B90B] hover:text-[#F0B90B]/80 underline">
                      Terms of Service
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-xs text-red-400">{errors.terms}</p>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{submitError}</p>
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
                    {t("auth.signup.loading")}
                  </>
                ) : (
                  <>
                    {t("auth.signup.submit")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </PremiumButton>
            </form>
          </PremiumCard>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-white/70 text-sm">
              {t("auth.signup.haveAccount")}{" "}
              <Link to={getLangPath(lang as any, "/signin")} className="text-[#F0B90B] hover:text-[#F0B90B]/80 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default SignUpPage;
