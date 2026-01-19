import React, { useEffect, useMemo, useState, useRef } from "react";
import { Shield, KeyRound, Mail, User2, AtSign, Lock, Check, X, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { validateReferralCode, signUpInviteOnly, isSupabaseConfigured, createProfileIfMissing, supabase } from "../../lib/supabase";
import { NoticeBox } from "../../components/ui/NoticeBox";
import { validateUsername } from "../../lib/authHelpers";

type ReferralState = "idle" | "checking" | "valid" | "invalid";

interface SignUpProps {
  lang?: Language;
}

export default function SignUp({ lang }: SignUpProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  // Check if Supabase is configured
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-md lg:max-w-lg mx-auto px-4">
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
            <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
          </div>
          <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-[1.06]">
            {t("auth.signup.title")}
          </h1>
        </div>
        
        <NoticeBox variant="warning" title="Configuration Error">
          The application is not properly configured. Please contact support or check back later.
        </NoticeBox>
      </div>
    );
  }

  const [referralCode, setReferralCode] = useState("TPC-BOOT01"); // Pre-fill with bootstrap code
  const [refState, setRefState] = useState<ReferralState>("idle");
  const [refMsg, setRefMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { checkEmail: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugErr, setDebugErr] = useState<any>(null);

  // Ref to cache validation results and prevent duplicate API calls
  const lastValidatedRef = useRef<{ code: string; valid: boolean } | null>(null);
  const requestSeqRef = useRef(0);

  // Cache translation text to avoid pulling t() into useEffect
  const referralInvalidText = useMemo(() => t("auth.signup.referralInvalid"), [t]);
  const referralGenericText = useMemo(() => t("auth.signup.errorGeneric"), [t]);
  const referralCheckingText = useMemo(() => t("auth.signup.referralChecking"), [t]);
  const signupGenericText = useMemo(() => t("auth.signup.errorGeneric"), [t]);
  const signupEmailInUseText = useMemo(
    () => t("auth.signup.errorEmailInUse"),
    [t]
  );

  const normalizedReferral = useMemo(() => referralCode.trim().toUpperCase(), [referralCode]);
  
  // Email validation
  const emailValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, [email]);
  
  // Username validation using helper
  const usernameValidation = useMemo(() => validateUsername(username.trim()), [username]);
  
  // Password match validation
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
  
  const canSubmit = useMemo(() => {
    // Prevent submit during any loading or invalid state
    if (submitting) return false;
    if (refState === "checking" || refState === "invalid") return false;
    if (!normalizedReferral) return false;
    if (refState !== "valid") return false;
    if (!fullName.trim()) return false;
    if (!usernameValidation.valid) return false;
    if (!email.trim()) return false;
    if (!emailValid) return false;
    if (password.length < 8) return false;
    if (!passwordsMatch) return false;
    return true;
  }, [submitting, refState, normalizedReferral, fullName, usernameValidation, email, emailValid, password, passwordsMatch]);

  // Referral validation with caching, debouncing, and anti-stale request pattern
  useEffect(() => {
    const code = referralCode.trim().toUpperCase();

    // Reset if empty
    if (!code) {
      setRefState("idle");
      setRefMsg(null);
      return;
    }

    // Use cache if same code
    if (lastValidatedRef.current?.code === code) {
      const valid = lastValidatedRef.current.valid;
      setRefState(valid ? "valid" : "invalid");
      setRefMsg(valid ? null : referralInvalidText);
      return;
    }

    // Set checking once for new code (no double setting)
    setRefState("checking");
    setRefMsg(null);

    // Debounce with anti-stale request pattern
    const mySeq = ++requestSeqRef.current;

    const timer = window.setTimeout(async () => {
      try {
        console.log("[SignUp] Validating referral code:", code);

        // Add timeout guard for referral validation
        const validatePromise = validateReferralCode(code);
        const timeoutPromise = new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error("referral validate timeout")), 5000)
        );

        const isValid = await Promise.race([validatePromise, timeoutPromise]);

        // Anti-stale: ignore if newer request exists
        if (mySeq !== requestSeqRef.current) return;

        lastValidatedRef.current = { code, valid: isValid };
        setRefState(isValid ? "valid" : "invalid");
        setRefMsg(isValid ? null : referralInvalidText);
      } catch (err) {
        // Anti-stale: ignore if newer request exists
        if (mySeq !== requestSeqRef.current) return;

        // Telemetry: log referral validation failure
        console.warn('[TELEMETRY] Referral validation failed:', { 
          code, 
          error: (err as any)?.message || 'unknown' 
        });

        lastValidatedRef.current = { code, valid: false };
        setRefState("invalid");
        setRefMsg(referralGenericText);
        console.error("[SignUp] validateReferralCode error:", err);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [referralCode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    console.log("[SIGNUP] Starting signup process...");
    setSubmitting(true);
    
    try {
      console.log("[SIGNUP] Calling signUpInviteOnly with:", {
        referralCode: normalizedReferral,
        email: email.trim(),
        fullName: fullName.trim(),
        username: username.trim().toLowerCase()
      });
      
      const res = await signUpInviteOnly({
        referralCode: normalizedReferral,
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
      });

      console.log("[SIGNUP RESPONSE:", { res });

      // Try to create profile if signup succeeded
      if (res && !res.checkEmail) {
        console.log("[SIGNUP] User created directly, attempting profile creation...");
        
        // Try to get user ID and create profile with timeout
        if (supabase) {
          try {
            // Add timeout for getUser call
            const userPromise = supabase.auth.getUser();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('getUser timeout')), 5000)
            );
            
            const { data: { user } } = await Promise.race([userPromise, timeoutPromise]) as any;
            console.log("[SIGNUP] Got user:", { user: !!user });
            
            if (user) {
              // Add timeout for profile creation
              const profilePromise = createProfileIfMissing(
                user.id,
                email.trim(),
                fullName.trim(),
                username.trim().toLowerCase(),
                normalizedReferral
              );
              
              const profileTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
              );
              
              const profileResult = await Promise.race([profilePromise, profileTimeoutPromise]) as any;
              console.log("[SIGNUP] PROFILE RESULT:", profileResult);
              
              if (!profileResult.success) {
                console.error('Profile creation failed:', profileResult.message);
                // Don't fail the signup, but log the error
                // The user can still proceed, but might have limited access
              }
            } else {
              console.log("[SIGNUP] No user found, skipping profile creation");
            }
          } catch (userError: any) {
            console.error('[SIGNUP] User/profile creation error:', userError);
            // Don't fail the signup, continue to success state
          }
        } else {
          console.log("[SIGNUP] Supabase not available, skipping profile creation");
        }
      } else {
        console.log("[SIGNUP] Email verification required, skipping profile creation");
      }

      console.log("[SIGNUP] Setting done state:", { checkEmail: !!res?.checkEmail });
      setDone({ checkEmail: !!res?.checkEmail });
      
    } catch (err: any) {
      setDebugErr(err);
      console.error('[SIGNUP] Signup error:', {
        message: err?.message || 'Unknown error',
        status: err?.status,
        code: err?.code,
        isAuthApiError: err?.message?.includes('AuthApiError'),
        stack: err?.stack
      });
      
      // Telemetry: log signup failure with privacy masking
      const emailMasked = email.replace(/(.{2}).+(@.+)/, "$1***$2");
      console.error('[TELEMETRY] Signup failed:', { 
        email: emailMasked, 
        referralCode: normalizedReferral, 
        error: err?.message || 'unknown',
        status: err?.status,
        code: err?.code
      });
      
      // Context-based error mapping based on error type
      let errorMessage = signupGenericText;
      
      console.error('[SIGNUP] Full error details:', {
        error: err,
        message: err?.message,
        status: err?.status,
        code: err?.code,
        stack: err?.stack
      });
      
      if (err?.status === 500 || err?.message?.includes('Database error')) {
        errorMessage = t("auth.signup.errorGeneric"); // "Failed to create account"
      } else if (err?.status === 400 || err?.message?.includes('Invalid')) {
        errorMessage = t("auth.signup.errorGeneric"); // "Failed to create account"
      } else if (err?.message?.includes('referral')) {
        errorMessage = t("auth.signup.referralInvalid");
      } else if (err?.message?.includes('email') || err?.message?.includes('already registered')) {
        errorMessage = t("auth.signup.errorEmailInUse");
      } else {
        // Default case - show more specific error if available
        errorMessage = err?.message || t("auth.signup.errorGeneric");
      }
      
      setError(errorMessage);
    } finally {
      console.log('[SIGNUP] Setting submitting to false');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md lg:max-w-lg mx-auto px-4">
      <div className="text-center mb-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
          <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
        </div>
        <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-[1.06]">
          {t("auth.signup.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65 max-w-[42ch] mx-auto">
          {t("auth.signup.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border-[#F0B90B]/20 bg-[#F0B90B]/8 p-4 mb-5">
        <div className="text-sm font-semibold text-white mb-1">
          {t("auth.signup.noticeTitle")}
        </div>
        <div className="text-xs text-white/70 leading-relaxed">
          {t("auth.signup.noticeDesc")}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

        {done ? (
          <div className="relative p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 grid place-items-center shrink-0">
                <Check className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {done.checkEmail ? t("auth.signup.checkEmailTitle") : t("auth.signup.successTitle")}
                </h2>
                <p className="text-white/65 mt-2 text-sm leading-relaxed">
                  {done.checkEmail ? t("auth.signup.checkEmailDesc") : t("auth.signup.successDesc")}
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to={getLangPath(L, "/signin")} className="flex-1">
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] flex items-center justify-center gap-2"
                    >
                      {t("common.backToSignIn")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link to={getLangPath(L, "/")} className="flex-1">
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 active:translate-y-[1px]"
                    >
                      {t("common.backHome")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="relative p-5 sm:p-6 space-y-4">
            <Field
              icon={<KeyRound className="w-4 h-4" />}
              label={t("auth.signup.referral")}
              value={referralCode}
              onChange={(v) => setReferralCode(v)}
              placeholder={t("auth.signup.referralPlaceholder")}
              right={
                refState === "checking" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                ) : refState === "valid" ? (
                  <Check className="w-4 h-4 text-[#F0B90B]" />
                ) : refState === "invalid" ? (
                  <X className="w-4 h-4 text-red-400" />
                ) : null
              }
              helper={
                refMsg || 
                (refState === "checking" ? referralCheckingText :
                 refState === "valid" ? t("auth.signup.referralValid") : 
                 t("auth.signup.referralHint"))
              }
              helperTone={refState === "invalid" ? "error" : refState === "valid" ? "ok" : "muted"}
            />

            <Field
              icon={<User2 className="w-4 h-4" />}
              label={t("auth.signup.fullName")}
              value={fullName}
              onChange={(v) => setFullName(v)}
              placeholder={t("auth.signup.fullNamePlaceholder")}
            />

            <Field
              icon={<AtSign className="w-4 h-4" />}
              label={t("auth.signup.username")}
              value={username}
              onChange={(v) => setUsername(v.toLowerCase())}
              placeholder={t("auth.signup.usernamePlaceholder")}
              helper={
                username
                  ? usernameValidation.valid
                    ? t("auth.signup.usernameOk")
                    : usernameValidation.error || t("auth.signup.usernameRules")
                  : t("auth.signup.usernameHint")
              }
              helperTone={username ? (usernameValidation.valid ? "ok" : "error") : "muted"}
            />

            <Field
              icon={<Mail className="w-4 h-4" />}
              label={t("auth.signup.email")}
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="name@email.com"
              type="email"
            />

            <Field
              icon={<Lock className="w-4 h-4" />}
              label={t("auth.signup.password")}
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              helper={t("auth.signup.passwordHint")}
              helperTone="muted"
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Field
              icon={<Lock className="w-4 h-4" />}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              helper={
                confirmPassword
                  ? passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"
                  : ""
              }
              helperTone={confirmPassword ? (passwordsMatch ? "ok" : "error") : "muted"}
              right={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-white/50 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {import.meta.env.DEV && debugErr ? (
              <pre className="mt-3 text-xs text-white/70 bg-white/5 border border-white/10 rounded-xl p-3 overflow-auto">
{JSON.stringify(
  {
    status: debugErr?.status,
    code: debugErr?.code,
    message: debugErr?.message,
    details: debugErr?.details,
    hint: debugErr?.hint,
  },
  null,
  2
)}
              </pre>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.signup.creating")}
                  </>
                ) : (
                  <>
                    {t("auth.signup.createAccount")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-xs text-white/40">
                {t("auth.signup.inviteOnly")}
              </p>
            </div>

            <div className="text-xs text-white/45 text-center mt-3">
              {t("auth.reassurance")}
            </div>

            <div className="text-center text-sm text-white/60 pt-3">
              <span>{t("auth.signup.haveAccount")}</span>{" "}
              <Link to={getLangPath(L, "/signin")} className="text-[#F0B90B] hover:underline underline-offset-4 font-medium">
                {t("auth.signup.goLogin")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  right?: React.ReactNode;
  helper?: string | null;
  helperTone?: "muted" | "ok" | "error";
}) {
  const { icon, label, value, onChange, placeholder, type, right, helper, helperTone = "muted" } = props;

  const helperClass =
    helperTone === "ok"
      ? "text-[#F0B90B]/90"
      : helperTone === "error"
        ? "text-red-300"
        : "text-white/50";

  return (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-2.5">{label}</label>
      <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
        <div className="text-white/50 shrink-0">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type || "text"}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
          autoComplete="off"
        />
        {right ? <div className="text-white/70 shrink-0">{right}</div> : null}
      </div>
      {helper ? <div className={`mt-2 text-xs leading-relaxed ${helperClass}`}>{helper}</div> : null}
    </div>
  );
}
