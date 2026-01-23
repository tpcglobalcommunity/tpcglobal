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
                onClick={() => navigate(ensureLangPath(lang, "/signin"))}
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
            {t("common.language.en")}
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
            {t("common.language.id")}
          </button>
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
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder={t("signup.inviteCode.placeholder")}
                      className={`w-full pl-10 pr-10 h-12 rounded-xl bg-white/5 border ${
                        refStatus === "valid" 
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
                  {!isInviteFormatValid && code && (
                    <p className="mt-2 text-sm text-yellow-400">
                      {t("signup.inviteCode.invalidFormat")}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
                  {t("signup.fullName.label")} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("signup.fullName.placeholder")}
                    className="w-full pl-10 h-12 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>

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
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("signup.username.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      username && !isUsernameValid 
                        ? "border-red-500/50 bg-red-500/5" 
                        : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {username && !isUsernameValid && (
                  <p className="mt-2 text-sm text-red-400">
                    {t("signup.username.helper")}
                  </p>
                )}
              </div>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("signup.email.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      email && !isEmailValid 
                        ? "border-red-500/50 bg-red-500/5" 
                        : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {email && !isEmailValid && (
                  <p className="mt-2 text-sm text-red-400">
                    {t("signup.email.invalid")}
                  </p>
                )}
              </div>

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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("signup.password.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      password && !isPasswordValid 
                        ? "border-red-500/50 bg-red-500/5" 
                        : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {password && !isPasswordValid && (
                  <p className="mt-2 text-sm text-red-400">
                    {t("signup.password.helper")}
                  </p>
                )}
              </div>

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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("signup.confirmPassword.placeholder")}
                    className={`w-full pl-10 h-12 rounded-xl bg-white/5 border ${
                      confirmPassword && !isPasswordMatch 
                        ? "border-red-500/50 bg-red-500/5" 
                        : "border-white/20"
                    } text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all`}
                  />
                </div>
                {confirmPassword && !isPasswordMatch && (
                  <p className="mt-2 text-sm text-red-400">
                    {t("signup.password.mismatch")}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full h-12 rounded-xl font-semibold transition-all ${
                  canSubmit
                    ? "bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black hover:from-[#F0B90B]/90 hover:to-[#F8D568]/90 shadow-lg shadow-[#F0B90B]/20"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("signup.loading")}
                  </span>
                ) : (
                  t("signup.submit")
                )}
              </button>

              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  {t("signup.haveAccount")}{" "}
                  <Link 
                    to={ensureLangPath(lang, "/signin")}
                    className="text-[#F0B90B] hover:text-[#F8D568] font-medium transition-colors"
                  >
                    {t("signup.signIn")}
                  </Link>
                </p>
              </div>
            </form>
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
