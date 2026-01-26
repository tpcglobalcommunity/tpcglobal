import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { ensureLangPath, type Language } from "@/i18n";

interface SignUpPageProps {
  lang?: Language;
}

interface FormState {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  referral_code: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  referral_code?: string;
  general?: string;
}

export default function SignUpPage({ lang = "en" }: SignUpPageProps) {
  const navigate = useNavigate();

  // Form state
  const [formState, setFormState] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    referral_code: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // Redirect authenticated users away
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          navigate(ensureLangPath(lang, "/member/dashboard"));
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };

    checkAuth();
  }, [lang, navigate]);

  // Simple translation fallback
  const t = (key: string, fallback?: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        "auth.signUp.title": "Create Account",
        "auth.signUp.subtitle": "Join TPC Global - Professional Trading Community",
        "auth.signUp.fullNameLabel": "Full Name",
        "auth.signUp.emailLabel": "Email Address",
        "auth.signUp.passwordLabel": "Password",
        "auth.signUp.confirmPasswordLabel": "Confirm Password",
        "auth.signUp.referralCodeLabel": "Referral Code (Optional)",
        "auth.signUp.submit": "Create Account",
        "auth.signUp.submitting": "Creating Account...",
        "auth.signUp.haveAccount": "Already have an account?",
        "auth.signUp.signInLink": "Sign In",
        "auth.signUp.errorGeneric": "Registration failed. Please try again.",
        "auth.signUp.errorPasswordMismatch": "Passwords do not match",
        "auth.signUp.errorPasswordShort": "Password must be at least 8 characters",
        "auth.signUp.errorNameShort": "Name must be at least 2 characters",
        "auth.signUp.errorEmailInvalid": "Please enter a valid email address",
        "auth.signUp.success": "Account created successfully!",
        "auth.signUp.checkEmail": "Please check your email to verify your account.",
      },
      id: {
        "auth.signUp.title": "Buat Akun",
        "auth.signUp.subtitle": "Gabung TPC Global - Komunitas Trading Profesional",
        "auth.signUp.fullNameLabel": "Nama Lengkap",
        "auth.signUp.emailLabel": "Alamat Email",
        "auth.signUp.passwordLabel": "Kata Sandi",
        "auth.signUp.confirmPasswordLabel": "Konfirmasi Kata Sandi",
        "auth.signUp.referralCodeLabel": "Kode Referral (Opsional)",
        "auth.signUp.submit": "Buat Akun",
        "auth.signUp.submitting": "Membuat Akun...",
        "auth.signUp.haveAccount": "Sudah punya akun?",
        "auth.signUp.signInLink": "Masuk",
        "auth.signUp.errorGeneric": "Pendaftaran gagal. Silakan coba lagi.",
        "auth.signUp.errorPasswordMismatch": "Kata sandi tidak cocok",
        "auth.signUp.errorPasswordShort": "Kata sandi minimal 8 karakter",
        "auth.signUp.errorNameShort": "Nama minimal 2 karakter",
        "auth.signUp.errorEmailInvalid": "Masukkan alamat email yang valid",
        "auth.signUp.success": "Akun berhasil dibuat!",
        "auth.signUp.checkEmail": "Silakan periksa email Anda untuk verifikasi akun.",
      },
    };

    return translations[lang]?.[key] || fallback || key;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formState.full_name.trim()) {
      newErrors.full_name = t("auth.signUp.errorNameShort");
    } else if (formState.full_name.trim().length < 2) {
      newErrors.full_name = t("auth.signUp.errorNameShort");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      newErrors.email = t("auth.signUp.errorEmailInvalid");
    } else if (!emailRegex.test(formState.email)) {
      newErrors.email = t("auth.signUp.errorEmailInvalid");
    }

    // Password validation
    if (!formState.password) {
      newErrors.password = t("auth.signUp.errorPasswordShort");
    } else if (formState.password.length < 8) {
      newErrors.password = t("auth.signUp.errorPasswordShort");
    }

    // Confirm password validation
    if (!formState.confirm_password) {
      newErrors.confirm_password = t("auth.signUp.errorPasswordMismatch");
    } else if (formState.password !== formState.confirm_password) {
      newErrors.confirm_password = t("auth.signUp.errorPasswordMismatch");
    }

    // Referral code validation (optional)
    if (formState.referral_code.trim()) {
      const trimmedCode = formState.referral_code.trim().toUpperCase();
      if (trimmedCode.length < 3) {
        newErrors.referral_code = "Referral code too short";
      }
      formState.referral_code = trimmedCode;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formState.email.trim(),
        password: formState.password,
        options: {
          data: {
            full_name: formState.full_name.trim(),
            referral_code: formState.referral_code.trim() || null,
          },
          emailRedirectTo: `${window.location.origin}${ensureLangPath(lang, "/auth/callback")}`,
        },
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      if (data.user && !data.session) {
        // Email confirmation required
        setSuccessEmail(formState.email);
        setTimeout(() => {
          navigate(ensureLangPath(lang, "/check-email") + `?email=${encodeURIComponent(formState.email)}`);
        }, 2000);
      } else if (data.session) {
        // Auto sign-in (email confirmation disabled)
        navigate(ensureLangPath(lang, "/member/dashboard"));
      }

    } catch (err) {
      console.error("Sign up error:", err);
      setErrors({ general: t("auth.signUp.errorGeneric") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Success state
  if (successEmail) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center px-4">
          <PremiumCard className="w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                {t("auth.signUp.success")}
              </h1>
              <p className="text-white/70 mb-6">
                {t("auth.signUp.checkEmail")}
              </p>
              <p className="text-sm text-white/50 mb-6">
                {successEmail}
              </p>
              <NoticeBox variant="info" title="">
                Check your spam folder if you don't see the email within a few minutes.
              </NoticeBox>
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <PremiumCard className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("auth.signUp.title")}
            </h1>
            <p className="text-white/70">
              {t("auth.signUp.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <NoticeBox variant="danger" title="">
                {errors.general}
              </NoticeBox>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.signUp.fullNameLabel")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={formState.full_name}
                  onChange={handleInputChange("full_name")}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all ${
                    errors.full_name 
                      ? "border-red-500/50 focus:ring-red-500/50" 
                      : "border-white/10 focus:border-[#F0B90B]/50"
                  }`}
                  placeholder={t("auth.signUp.fullNameLabel")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.signUp.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange("email")}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all ${
                    errors.email 
                      ? "border-red-500/50 focus:ring-red-500/50" 
                      : "border-white/10 focus:border-[#F0B90B]/50"
                  }`}
                  placeholder={t("auth.signUp.emailLabel")}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.signUp.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formState.password}
                  onChange={handleInputChange("password")}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all ${
                    errors.password 
                      ? "border-red-500/50 focus:ring-red-500/50" 
                      : "border-white/10 focus:border-[#F0B90B]/50"
                  }`}
                  placeholder={t("auth.signUp.passwordLabel")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.signUp.confirmPasswordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formState.confirm_password}
                  onChange={handleInputChange("confirm_password")}
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all ${
                    errors.confirm_password 
                      ? "border-red-500/50 focus:ring-red-500/50" 
                      : "border-white/10 focus:border-[#F0B90B]/50"
                  }`}
                  placeholder={t("auth.signUp.confirmPasswordLabel")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-400">{errors.confirm_password}</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t("auth.signUp.referralCodeLabel")}
              </label>
              <input
                type="text"
                value={formState.referral_code}
                onChange={handleInputChange("referral_code")}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent transition-all ${
                  errors.referral_code 
                    ? "border-red-500/50 focus:ring-red-500/50" 
                    : "border-white/10 focus:border-[#F0B90B]/50"
                }`}
                placeholder={t("auth.signUp.referralCodeLabel")}
                disabled={isSubmitting}
              />
              {errors.referral_code && (
                <p className="mt-1 text-sm text-red-400">{errors.referral_code}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/80 text-black font-semibold rounded-lg hover:from-[#F0B90B]/90 hover:to-[#F0B90B]/70 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("auth.signUp.submitting")}
                </>
              ) : (
                t("auth.signUp.submit")
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-white/70">
              {t("auth.signUp.haveAccount")}{" "}
              <a
                href={ensureLangPath(lang, "/signin")}
                className="text-[#F0B90B] hover:text-[#F0B90B]/80 font-medium transition-colors"
              >
                {t("auth.signUp.signInLink")}
              </a>
            </p>
          </div>
        </PremiumCard>
      </div>
    </PremiumShell>
  );
}
