import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, CheckCircle2, XCircle, Mail, User, Lock, Shield, AlertCircle } from "lucide-react";
import { useI18n } from "../../i18n";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getAppSettings } from "../../lib/appSettings";
import { buildAuthRedirect } from "../../lib/authRedirect";
import { ensureLangPath } from "../../utils/langPath";
import { devLog } from "../../utils/devLog";
import { normalizeInviteCode, isInviteCodeFormatValid } from "../../utils/inviteCode";
import { 
  validateForm, 
  isFormValid, 
  normalizeUsername,
  type FormTouched,
  type FormState
} from "../../utils/validators";
import { BUILD_ID } from "../../utils/buildInfo";
import RegistrationsClosedPage from "../system/RegistrationsClosedPage";

type ReferralStatus = "idle" | "checking" | "valid" | "invalid";

export default function SignUp() {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Settings and guard states
  const [settings, setSettings] = useState<any | null>(null);
  const [settingsErr, setSettingsErr] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form state
  const [formState, setFormState] = useState<FormState>({
    inviteCode: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [touched, setTouched] = useState<FormTouched>({
    inviteCode: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [refStatus, setRefStatus] = useState<ReferralStatus>("idle");
  const [refMessage, setRefMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const lastCheckedRef = useRef<string>("");

  // Guard: Redirect authenticated users away from signup
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not available');
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;
        if (error) throw error;

        const session = data.session;
        if (!session?.user) return;

        setIsRedirecting(true);

        const isVerified = !!session.user.email_confirmed_at;

        if (!isVerified) {
          navigate(ensureLangPath(lang, "/verify-required"));
        } else {
          navigate(ensureLangPath(lang, "/member"));
        }
      } catch (err) {
        console.error("[SIGNUP_GUARD_ERROR]", err);
        setIsRedirecting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lang, navigate]);

  // Load app settings
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setSettingsErr(null);
        const s = await getAppSettings(supabase);
        if (!alive) return;
        devLog("[APP_SETTINGS]", s);
        setSettings(s);
      } catch (err) {
        if (!alive) return;
        console.error('Failed to load settings:', err);
        setSettingsErr('Failed to load settings');
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Prefill invite code from URL
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setFormState(prev => ({ ...prev, inviteCode: refParam }));
    }
  }, [searchParams]);

  // Computed values
  const code = useMemo(() => normalizeInviteCode(formState.inviteCode), [formState.inviteCode]);
  const uname = useMemo(() => normalizeUsername(formState.username), [formState.username]);
  const emailTrim = useMemo(() => formState.email.trim(), [formState.email]);

  const referralEnabled = settings?.referral_enabled ?? true;
  const maintenance = settings?.maintenance_mode === true;
  const registrationsOpen = settings?.registrations_open ?? true;

  // Form validation
  const errors = useMemo(() => {
    return validateForm(formState, touched, referralEnabled, submitAttempted);
  }, [formState, touched, referralEnabled, submitAttempted]);

  const canSubmit = useMemo(() => {
    return !isSubmitting && isFormValid(formState, referralEnabled, refStatus);
  }, [isSubmitting, formState, referralEnabled, refStatus]);

  // Referral validation (debounced)
  useEffect(() => {
    let alive = true;

    if (!referralEnabled) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
      setRefStatus("idle");
      setRefMessage(null);
      return;
    }

    if (!code) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
      setRefStatus("idle");
      setRefMessage(null);
      return;
    }

    if (!isInviteCodeFormatValid(code)) {
      setRefStatus("idle");
      setRefMessage(null);
      return;
    }

    if (code === lastCheckedRef.current) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    setRefStatus("checking");
    setRefMessage(t("signup.inviteCode.checking"));

    debounceRef.current = window.setTimeout(async () => {
      if (!alive) return;
      
      try {
        lastCheckedRef.current = code;

        devLog("[REFERRAL_RPC_CALL]", { code });

        const { data, error: refErr } = await supabase.rpc("validate_referral_code_public", {
          p_code: code,
        });

        devLog("[REFERRAL_RPC_RESULT]", { code, data, error: refErr });

        if (refErr) {
          devLog("Referral RPC error:", refErr);
          setRefStatus("invalid");
          setRefMessage(t("signup.inviteCode.invalid"));
          return;
        }

        if (!alive) return;

        setRefStatus(data === true ? "valid" : "invalid");
        setRefMessage(data === true 
          ? t("signup.inviteCode.valid")
          : t("signup.inviteCode.invalid")
        );
      } catch {
        if (!alive) return;
        
        setRefStatus("invalid");
        setRefMessage(t("signup.inviteCode.invalid"));
      }
    }, 500);

    return () => {
      alive = false;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [code, t, referralEnabled]);

  // Form field handlers
  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setError(null); // Clear general errors when user types
  };

  const handleBlur = (field: keyof FormTouched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Check username availability using RPC (NO PROFILE QUERY)
  const checkUsernameAvailability = async (username: string): Promise<{ status: 'ok' | 'unknown' | 'error', available: boolean }> => {
    const u = (username ?? '').trim().toLowerCase();
    if (!u) return { status: 'unknown', available: true };

    const { data, error } = await supabase.rpc('check_username_available', { username_text: u });

    if (error) {
      const msg = String((error as any).message ?? '').toLowerCase();
      const isRpcMissing = msg.includes('404') || msg.includes('not found') || msg.includes('function');

      if (isRpcMissing) {
        // fallback: jangan block signup kalau RPC belum ada / belum terdeploy
        return { status: 'unknown', available: true };
      }

      return { status: 'error', available: true };
    }

    // RPC returns JSON with available field
    const available = data?.available === true;
    return { status: 'ok', available };
  };

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setError(null);

    if (!canSubmit) {
      const errorList = [];
      if (referralEnabled && refStatus !== "valid") errorList.push(t("signup.errors.inviteRequired"));
      if (!errors.username) errorList.push(t("signup.errors.usernameFormat"));
      if (!errors.email) errorList.push(t("signup.errors.invalidEmail"));
      if (!errors.password) errorList.push(t("signup.errors.passwordWeak"));
      if (!errors.confirmPassword) errorList.push(t("signup.errors.passwordMismatch"));
      
      setError(errorList.join(". "));
      return;
    }

    setIsSubmitting(true);
    try {
      // Check username availability
      const usernameCheck = await checkUsernameAvailability(uname);
      if (usernameCheck.status === 'ok' && !usernameCheck.available) {
        setError(t("signup.errors.usernameTaken"));
        return;
      }

      // Validate invite code if required
      if (referralEnabled) {
        const { data: valid, error: refErr } = await supabase.rpc("validate_referral_code_public", {
          p_code: code,
        });
        if (refErr || valid !== true) throw new Error(t("signup.errors.inviteInvalid"));
      }

      // Create Supabase auth user
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: emailTrim,
        password: formState.password,
        options: { 
          data: { 
            username: uname, 
            referral_code: code 
          },
          emailRedirectTo: buildAuthRedirect(`/${lang}/auth/callback`)
        },
      });

      if (signUpErr) {
        if (signUpErr.message.includes('already registered')) {
          setError(t("signup.errors.emailTaken"));
        } else if (signUpErr.message.includes('weak password')) {
          setError(t("signup.errors.passwordWeak"));
        } else {
          setError(signUpErr?.message || t("signup.errors.generic"));
        }
        return;
      }

      // DO NOT create profile here - profile is created after email verification
      // NO PROFILE INSERT DURING SIGNUP - this causes 401/406 errors

      setSuccessEmail(data.user?.email ?? emailTrim);
      
      // Reset form
      setFormState({
        inviteCode: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      setTouched({
        inviteCode: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message.includes('network') || err.message.includes('fetch')) {
        setError(t("signup.errors.network"));
      } else {
        setError(err?.message || t("signup.errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Conditional rendering
  if (!settings || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p>{t("common.loading") || "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!registrationsOpen) {
    return <RegistrationsClosedPage lang={lang} />;
  }

  // Success state
  if (successEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
        <div className="absolute inset-0 bg-gradient-radial from-[#F0B90B]/5 via-transparent to-transparent" />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                {t("signup.success.title")}
              </h1>
              <p className="text-white/60 text-lg mb-2">
                {t("signup.success.checkEmail")}
              </p>
              <p className="text-white/40 text-sm">
                {t("signup.success.sentTo")} <span className="text-white/60 font-medium">{successEmail}</span>
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-4">
              <button
                onClick={() => window.location.href = "mailto:"}
                className="w-full h-12 rounded-xl bg-[#F0B90B] text-black font-semibold hover:bg-[#F0B90B]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {t("signup.success.openEmail")}
              </button>
              
              <button
                onClick={() => navigate(ensureLangPath(lang, "/signin?justSignedUp=1"))}
                className="w-full h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {t("signup.success.goToSignIn")}
              </button>
            </div>

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-[#F0B90B]/5 via-transparent to-transparent" />
      
      {/* BIG BUILD STAMP BANNER - Always Visible */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/20 px-4 py-2">
        <div className="text-center">
          <span className="text-xs font-mono text-white/80 bg-black/50 px-3 py-1 rounded-full border border-white/10">
            BUILD: {BUILD_ID} • LANG: {lang} • PATH: {typeof window !== 'undefined' ? window.location.pathname : 'loading...'}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#F8D568] flex items-center justify-center mb-6 shadow-lg shadow-[#F0B90B]/20">
              <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TPC</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {t("signup.title")}
            </h1>
            <p className="text-white/60 text-lg">
              {t("signup.subtitle")}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#F0B90B] via-[#F8D568] to-[#F0B90B]" />
            
            <form onSubmit={onSubmit} noValidate className="p-8 space-y-6">
              {settingsErr && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-sm">
                  {t("signup.settingsLoadError")}
                </div>
              )}

              {maintenance && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                  {t("signup.maintenanceNotice")}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Invite Code */}
              {referralEnabled && (
                <div>
                  <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                    {t("signup.inviteCode.label")} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-white/40" />
                    </div>
                    <input
                      type="text"
                      value={formState.inviteCode}
                      onChange={(e) => handleFieldChange('inviteCode', e.target.value.toUpperCase())}
                      onBlur={() => handleBlur('inviteCode')}
                      placeholder={t("signup.inviteCode.placeholder")}
                      className={`w-full pl-10 pr-10 h-12 rounded-xl bg-white/5 border ${
                        errors.inviteCode 
                          ? "border-red-500/50 bg-red-500/5" 
                          : refStatus === "valid" 
                          ? "border-green-500/50 bg-green-500/5" 
                          : refStatus === "invalid" 
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-white/20"
                      } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {refStatus === "checking" && (
                        <Loader2 className="h-5 w-5 animate-spin text-white/60" />
                      )}
                      {refStatus === "valid" && (
                        <CheckCircle2 className="h-5 w-5 text-[#F0B90B]" />
                      )}
                      {refStatus === "invalid" && (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  {refMessage && (
                    <p className={`mt-2 text-sm ${
                      refStatus === "valid" 
                        ? "text-green-400" 
                        : refStatus === "invalid" 
                        ? "text-red-400" 
                        : "text-white/60"
                    }`}>
                      {refMessage}
                    </p>
                  )}
                  {errors.inviteCode && touched.inviteCode && (
                    <p className="mt-2 text-sm text-red-400">
                      {t(errors.inviteCode)}
                    </p>
                  )}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("signup.username.label")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={formState.username}
                    onChange={(e) => handleFieldChange('username', normalizeUsername(e.target.value))}
                    onBlur={() => handleBlur('username')}
                    placeholder={t("signup.username.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      errors.username ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.username && touched.username && (
                  <p className="mt-2 text-sm text-red-400">
                    {t(errors.username)}
                  </p>
                )}
                <p className="mt-2 text-xs text-white/40">
                  {t("signup.username.helper")}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("signup.email.label")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder={t("signup.email.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      errors.email ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-2 text-sm text-red-400">
                    {t(errors.email)}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("signup.password.label")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="password"
                    value={formState.password}
                    onChange={(e) => handleFieldChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder={t("signup.password.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      errors.password ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-400">
                    {t(errors.password)}
                  </p>
                )}
                <p className="mt-2 text-xs text-white/40">
                  {t("signup.password.helper")}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("signup.confirmPassword.label")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="password"
                    value={formState.confirmPassword}
                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder={t("signup.confirmPassword.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      errors.confirmPassword ? "border-red-500/50 bg-red-500/5" : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">
                    {t(errors.confirmPassword)}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full h-12 rounded-xl bg-[#F0B90B] text-black font-semibold hover:bg-[#F0B90B]/90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F0B90B]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("signup.loading")}
                  </>
                ) : (
                  t("signup.submit")
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6 text-white/40">
            <span>{t("signup.haveAccount")} </span>
            <Link 
              to={ensureLangPath(lang, "/signin")}
              className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors font-medium"
            >
              {t("signup.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
