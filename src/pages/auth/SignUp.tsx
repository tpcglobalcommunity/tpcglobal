import React, { useState, useEffect, useRef, useMemo } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useI18n } from "../../i18n";
import { Link } from "../../components/Router";
import { supabase } from "../../lib/supabase";
import { getAppSettings } from "../../lib/appSettings";
import RegistrationsClosedPage from "../system/RegistrationsClosedPage";

type ReferralStatus = "idle" | "checking" | "valid" | "invalid";

export default function SignUp() {
  const { t, language: lang } = useI18n();
  const [settings, setSettings] = useState<any | null>(null);
  const [settingsErr, setSettingsErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setSettingsErr(null);
        const s = await getAppSettings(supabase);
        if (!alive) return;
        setSettings(s);
      } catch (e: any) {
        if (!alive) return;
        setSettingsErr(e?.message || null);
        setSettings(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [referralCode, setReferralCode] = useState("");
  const [username, setUsername] = useState("");
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

  const code = useMemo(() => referralCode.trim().toUpperCase(), [referralCode]);
  const uname = useMemo(() => username.trim().toLowerCase(), [username]);
  const emailTrim = useMemo(() => email.trim(), [email]);

  // NOTE: sesuai UI hint kamu: underscore saja (tanpa titik)
  const usernameRegex = /^[a-z0-9_]{3,20}$/;

  const localValidateError = useMemo(() => {
    if (!code) return t("auth.signup.referralRequired") || "Referral code is required.";
    if (refStatus === "invalid") return t("auth.signup.referralInvalid") || "Invalid referral code.";
    if (!uname) return t("auth.signup.usernameRequired") || "Username is required.";
    if (!usernameRegex.test(uname))
      return t("auth.signup.usernameRules") || "3–20 chars: lowercase letters, numbers, underscore.";
    if (!emailTrim) return t("auth.signup.emailRequired") || "Email is required.";
    if (password.length < 8) return t("auth.signup.passwordMinLength") || "Password must be at least 8 characters.";
    if (password !== confirmPassword) return t("auth.signup.passwordMismatch") || "Passwords do not match.";
    return null;
  }, [code, refStatus, uname, emailTrim, password, confirmPassword, t]);

  // Gate: Check if registrations are open
  if (settings && settings.registrations_open === false) {
    return <RegistrationsClosedPage lang="en" />;
  }

  const referralEnabled = settings ? !!settings.referral_enabled : true;
  const inviteLimit = settings?.referral_invite_limit ?? 0;

  const canSubmit = useMemo(() => {
    return !isSubmitting && refStatus === "valid" && !localValidateError;
  }, [isSubmitting, refStatus, localValidateError]);

  // Referral validation (debounced, NO LOOP)
  useEffect(() => {
    setError(null);
    setSuccessEmail(null);

    if (!referralEnabled) {
      setRefStatus("idle");
      setRefMessage(null);
      lastCheckedRef.current = "";
      return;
    }

    if (!code) {
      setRefStatus("idle");
      setRefMessage(null);
      lastCheckedRef.current = "";
      return;
    }

    if (code === lastCheckedRef.current) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    setRefStatus("checking");
    setRefMessage(t("auth.signup.referralChecking") || "Checking referral code...");

    debounceRef.current = window.setTimeout(async () => {
      try {
        lastCheckedRef.current = code;

        const { data, error: refErr } = await supabase.rpc("validate_referral_code_public", {
          p_code: code,
        });

        if (refErr) throw refErr;

        if (data === true) {
          setRefStatus("valid");
          setRefMessage(t("auth.signup.referralValid") || "Valid referral code");
        } else {
          setRefStatus("invalid");
          setRefMessage(t("auth.signup.referralInvalid") || "Invalid referral code");
        }
      } catch {
        setRefStatus("invalid");
        setRefMessage(t("auth.signup.referralError") || "Failed to validate referral code");
      }
    }, 450);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [code, t]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessEmail(null);

    if (!canSubmit) {
      setError(localValidateError ?? (t("auth.signup.completeForm") || "Please complete the form."));
      return;
    }

    setIsSubmitting(true);
    try {
      // Final guard: validate referral again
      const { data: valid, error: refErr } = await supabase.rpc("validate_referral_code_public", {
        p_code: code,
      });
      if (refErr || valid !== true) throw new Error(t("auth.signup.referralInvalid") || "Invalid referral code.");

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          data: { username: uname, referral_code: code },
        },
      });

      if (signUpErr) throw signUpErr;
      setSuccessEmail(data.user?.email ?? emailTrim);
    } catch (err: any) {
      setError(err?.message ?? (t("auth.signup.errorGeneric") || "Failed to create account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md lg:max-w-lg mx-auto px-4">
      {/* Back to Home Button */}
      <div className="flex justify-end mb-4">
        <Link
          to={`/${lang}`}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← {t("auth.backToHome") || "Back to Home"}
        </Link>
      </div>

      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
          <div className="w-7 h-7 bg-[#F0B90B] rounded-lg relative z-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {t("auth.signup.title") || "Create Account"}
        </h1>
        <p className="text-sm text-white/70">
          {t("auth.signup.subtitle") || "Join TPC Global Community"}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

        <form onSubmit={onSubmit} className="relative p-6 sm:p-7 space-y-4">
        {settingsErr && (
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm mb-4">
            {t("signup.settingsLoadError") || "Could not load settings; proceeding with defaults."}
          </div>
        )}

        {!referralEnabled && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm mb-4">
            {t("signup.referralDisabledTitle") || "Referral System Disabled"}
            <div className="text-xs mt-1">
              {t("signup.referralDisabledDesc") || "Referral codes are temporarily disabled."}
            </div>
          </div>
        )}

        {referralEnabled && inviteLimit > 0 && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm mb-4">
            {t("signup.referralLimitHint") || `Referral limit: ${inviteLimit} per code`}
          </div>
        )}

        {/* Referral */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("auth.signup.referral") || "Referral Code"} *
          </label>
          <div className="relative">
            <input
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder={t("auth.signup.referralPlaceholder") || "TPC-XXXXXX"}
              className="w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {refStatus === "checking" && <Loader2 className="w-4 h-4 animate-spin text-white/60" />}
              {refStatus === "valid" && <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />}
              {refStatus === "invalid" && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
          </div>
          {refMessage && (
            <p
              className={`mt-2 text-xs ${
                refStatus === "valid" ? "text-[#F0B90B]" : refStatus === "invalid" ? "text-red-300" : "text-white/60"
              }`}
            >
              {refMessage}
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth.signup.username") || "Username"} *</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("auth.signup.usernamePlaceholder") || "johndoe"}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
          />
          <p className="mt-2 text-xs text-white/60">
            {t("auth.signup.usernameRules") || "3–20 chars: lowercase letters, numbers, underscore."}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth.signup.email") || "Email"} *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.signup.emailPlaceholder") || "email@example.com"}
            type="email"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">{t("auth.signup.password") || "Password"} *</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
            minLength={8}
          />
          <p className="mt-2 text-xs text-white/60">{t("auth.signup.passwordHint") || "At least 8 characters."}</p>
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t("auth.signup.confirmPasswordLabel") || "Confirm Password"} *
          </label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="********"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-[#F0B90B] text-white placeholder-white/50"
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
        )}

        {successEmail && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
            {(t("auth.signup.successTitle") || "Account created.")}{" "}
            {(t("auth.signup.checkEmailDesc") || "Please check your email to verify.")} <b>({successEmail})</b>
          </div>
        )}

        <button
          disabled={!canSubmit}
          type="submit"
          className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> {t("auth.signup.creating") || "Creating..."}
            </>
          ) : (
            t("auth.signup.createAccount") || "Create Account"
          )}
        </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60 mt-6">
        <div className="text-center sm:text-left">
          <span>{t("auth.signup.inviteOnly") || "Invite-only. Referral required."}</span>
        </div>
        <div className="text-center sm:text-right">
          <span>{t("signup.alreadyHaveAccount") || "Already have an account?"}{" "}</span>
          <Link 
            to={`/${lang}/signin`}
            className="text-[#F0B90B] hover:underline underline-offset-4 font-medium"
          >
            {t("signup.signIn") || "Sign In"}
          </Link>
        </div>
      </div>
    </div>
  );
}
