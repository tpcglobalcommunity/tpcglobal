import { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, CheckCircle2, XCircle, Mail, User, Lock, Shield } from "lucide-react";
import { useI18n } from "../../i18n";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getAppSettings } from "../../lib/appSettings";
import { buildAuthRedirect } from "../../lib/authRedirect";
import { ensureLangPath } from "../../utils/langPath";
import { devLog } from "../../utils/devLog";
import { normalizeInviteCode, isInviteCodeFormatValid } from "../../utils/inviteCode";
import RegistrationsClosedPage from "../system/RegistrationsClosedPage";

type ReferralStatus = "idle" | "checking" | "valid" | "invalid";

export default function SignUp() {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any | null>(null);
  const [settingsErr, setSettingsErr] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

        const isVerified = !!session.user.email_confirmed_at; // ✅ yang benar

        if (!isVerified) {
          navigate(ensureLangPath(lang, "/verify"));
        } else {
          navigate(ensureLangPath(lang, "/member"));
        }
      } catch (err) {
        console.error("[SIGNUP_GUARD_ERROR]", err);
        // kalau error, biarkan tetap di signup (guest flow)
        setIsRedirecting(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [lang, navigate]);

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

  // Form state
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [refStatus, setRefStatus] = useState<ReferralStatus>("idle");
  const [refMessage, setRefMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const lastCheckedRef = useRef<string>("");

  // Computed values
  const code = useMemo(() => normalizeInviteCode(inviteCode), [inviteCode]);
  const uname = useMemo(() => username.trim().toLowerCase(), [username]);
  const emailTrim = useMemo(() => email.trim(), [email]);

  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const referralEnabled = settings?.referral_enabled ?? true;
  const maintenance = settings?.maintenance_mode === true;
  const registrationsOpen = settings?.registrations_open ?? true;

  // Validation helpers
  const isInviteFormatValid = useMemo(() => {
    return !referralEnabled || isInviteCodeFormatValid(code);
  }, [code, referralEnabled]);

  const isUsernameValid = useMemo(() => {
    return usernameRegex.test(uname);
  }, [uname]);

  const isEmailValid = useMemo(() => {
    return emailRegex.test(emailTrim);
  }, [emailTrim]);

  const isPasswordValid = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const isPasswordMatch = useMemo(() => {
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const canSubmit = useMemo(() => {
    const inviteOk = referralEnabled ? refStatus === "valid" : true;
    return (
      !isSubmitting &&
      inviteOk &&
      isUsernameValid &&
      isEmailValid &&
      isPasswordValid &&
      isPasswordMatch
    );
  }, [
    isSubmitting,
    refStatus,
    referralEnabled,
    isUsernameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordMatch,
  ]);

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

    if (!isInviteFormatValid) {
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
    }, 450);

    return () => {
      alive = false;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [code, t, referralEnabled, isInviteFormatValid]);

  // Conditional rendering logic - NO HOOKS AFTER THIS POINT
  if (!settings || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Gate: Check if registrations are open
  if (!registrationsOpen) {
    return <RegistrationsClosedPage lang={lang} />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessEmail(null);

    if (!canSubmit) {
      const errors = [];
      if (referralEnabled && refStatus !== "valid") errors.push(t("signup.errors.inviteRequired"));
      if (!isUsernameValid) errors.push(t("signup.errors.usernameInvalid"));
      if (!isEmailValid) errors.push(t("signup.email.invalid"));
      if (!isPasswordValid) errors.push(t("signup.password.minLength"));
      if (!isPasswordMatch) errors.push(t("signup.password.mismatch"));
      
      setError(errors.join(". "));
      return;
    }

    setIsSubmitting(true);
    try {
      if (referralEnabled) {
        const { data: valid, error: refErr } = await supabase.rpc("validate_referral_code_public", {
          p_code: code,
        });
        if (refErr || valid !== true) throw new Error(t("signup.inviteCode.invalid"));
      }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: { 
          data: { username: uname, full_name: fullName, referral_code: code },
          emailRedirectTo: buildAuthRedirect(`/${lang}/auth/callback`)
        },
      });

      if (signUpErr) {
        setError(signUpErr?.message || t("signup.errors.generic"));
        return;
      }

      setSuccessEmail(data.user?.email ?? emailTrim);
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message || t("signup.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background vignette and glow */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-[#F0B90B]/5 via-transparent to-transparent" />
      
      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
          <button
            type="button"
            onClick={() => navigate(ensureLangPath("en", window.location.pathname))}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              lang === 'en' 
                ? 'bg-[#F0B90B] text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => navigate(ensureLangPath("id", window.location.pathname))}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              lang === 'id' 
                ? 'bg-[#F0B90B] text-black' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            ID
          </button>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F0B90B] to-[#F8D568] flex items-center justify-center mb-6 shadow-lg shadow-[#F0B90B]/20">
              <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TPC</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {t("auth.signup.title") ?? "Create your TPC account"}
            </h1>
            <p className="text-white/60 text-lg">
              {t("auth.signup.subtitle") ?? "Invitation-only access. Enter your code to continue."}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Gold accent border */}
            <div className="h-1 bg-gradient-to-r from-[#F0B90B] via-[#F8D568] to-[#F0B90B]" />
            
            <form onSubmit={onSubmit} noValidate className="p-8 space-y-6">
              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="company"
                autoComplete="off"
                tabIndex={-1}
                className="absolute -left-[9999px] w-0 h-0 opacity-0"
                aria-hidden="true"
              />

              {/* Status Messages */}
              {settingsErr && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-sm">
                  {t("auth.signup.settingsLoadError") ?? "Could not load settings; proceeding with defaults."}
                </div>
              )}

              {!isRedirecting && maintenance && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                  {t("auth.signup.maintenanceNotice") ?? "Platform is under maintenance. Registration remains open for invited users."}
                </div>
              )}

              {/* Referral Code */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {t("auth.signup.referral") ?? "Invitation Code"} *
                </label>
                <div className="relative">
                  <input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder={t("auth.signup.referralPlaceholder") ?? "TPC-XXXXXX"}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/20 text-white placeholder-white/40 transition-all"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {refStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin text-white/60" />}
                    {refStatus === "valid" && <CheckCircle2 className="w-5 h-5 text-[#F0B90B]" />}
                    {refStatus === "invalid" && <XCircle className="w-5 h-5 text-red-400" />}
                  </div>
                </div>
                {/* Fixed height status area to prevent layout jump */}
                <div className="h-6 mt-2">
                  {refMessage && (
                    <p className={`text-xs ${
                      refStatus === "valid" ? "text-[#F0B90B]" : refStatus === "invalid" ? "text-red-400" : "text-white/50"
                    }`}>
                      {refMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {t("auth.signup.username") ?? "Username"} *
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("auth.signup.usernamePlaceholder") ?? "johndoe"}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/20 text-white placeholder-white/40 transition-all"
                  required
                />
                <p className="mt-2 text-xs text-white/40">
                  {t("auth.signup.usernameRules") ?? "3–20 chars: lowercase letters, numbers, underscore."}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {t("auth.signup.email") ?? "Email"} *
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.signup.emailPlaceholder") ?? "email@example.com"}
                  type="email"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/20 text-white placeholder-white/40 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {t("auth.signup.password") ?? "Password"} *
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/20 text-white placeholder-white/40 transition-all"
                  required
                  minLength={8}
                />
                <p className="mt-2 text-xs text-white/40">{t("auth.signup.passwordHint") ?? "At least 8 characters."}</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  {t("auth.signup.confirmPasswordLabel") ?? "Confirm Password"} *
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/20 text-white placeholder-white/40 transition-all"
                  required
                  minLength={8}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm whitespace-pre-wrap">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              {successEmail ? (
                // Success State
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {t("auth.signup.successTitle") ?? "Account created successfully"}
                  </h2>
                  <p className="text-white/60 mb-6">
                    {t("auth.signup.checkEmailDesc") ?? "Please check your email (including spam folder) to verify your account. After verification, you can login."}
                  </p>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                    <p className="text-sm text-white/60 mb-2">{t("auth.signup.sentTo") ?? "Verification sent to:"}</p>
                    <p className="text-white font-medium">{successEmail}</p>
                  </div>
                  <Link
                    to={`/${lang}/signin`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F0B90B]/20 transition-all duration-200"
                  >
                    {t("auth.signup.goToSignIn") ?? "Go to Sign In"}
                  </Link>
                </div>
              ) : (
                // Form State
                <>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("auth.signup.creating") ?? "Creating..."}
                      </>
                    ) : (
                      t("auth.signup.createAccount") ?? "Create Account"
                    )}
                  </button>

                  {/* Footer Links */}
                  <div className="text-center pt-4 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                      <span>{t("auth.signup.footerLine1") ?? "By joining, you agree to our"}</span>
                      <Link to={`/${lang}/legal`} className="text-[#F0B90B] hover:underline">
                        {t("auth.signup.footerTerms") ?? "Terms & Privacy"}
                      </Link>
                      <span>{t("auth.signup.footerLine2") ?? "."}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-white/40">
                      <Link to={`/${lang}/legal#risk`} className="hover:text-white/60 transition-colors">
                        Risk Disclaimer
                      </Link>
                      <span>•</span>
                      <Link to={`/${lang}/docs`} className="hover:text-white/60 transition-colors">
                        Documentation
                      </Link>
                    </div>
                    <div className="text-xs text-white/30">
                      <span>{t("auth.signup.inviteOnly") ?? "Invitation-only community. Quality over quantity."}</span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center pt-2 border-t border-white/10">
                    <span className="text-sm text-white/60">
                      {t("auth.signup.alreadyHaveAccount") ?? "Already have an account?"}{" "}
                    </span>
                    <Link 
                      to={`/${lang}/signin`}
                      className="text-sm text-[#F0B90B] hover:underline font-medium"
                    >
                      {t("auth.signup.signIn") ?? "Sign In"}
                    </Link>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
