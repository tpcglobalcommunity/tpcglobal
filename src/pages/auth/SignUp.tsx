import React, { useEffect, useMemo, useState } from "react";
import { Shield, KeyRound, Mail, User2, AtSign, Lock, Check, X, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { validateReferralCode, signUpInviteOnly } from "../../lib/supabase";

type ReferralState = "idle" | "checking" | "valid" | "invalid";

interface SignUpProps {
  lang?: Language;
}

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

export default function SignUp({ lang }: SignUpProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  const [referralCode, setReferralCode] = useState("");
  const [refState, setRefState] = useState<ReferralState>("idle");
  const [refMsg, setRefMsg] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { checkEmail: boolean }>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedReferral = useMemo(() => referralCode.trim().toUpperCase(), [referralCode]);
  const usernameOk = useMemo(() => USERNAME_RE.test(username.trim().toLowerCase()), [username]);
  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (!normalizedReferral) return false;
    if (refState !== "valid") return false;
    if (!fullName.trim()) return false;
    if (!usernameOk) return false;
    if (!email.trim()) return false;
    if (password.length < 8) return false;
    return true;
  }, [submitting, normalizedReferral, refState, fullName, usernameOk, email, password]);

  useEffect(() => {
    let alive = true;
    let timer: any;

    setError(null);

    if (!normalizedReferral) {
      setRefState("idle");
      setRefMsg(null);
      return;
    }

    setRefState("checking");
    setRefMsg(null);

    timer = setTimeout(async () => {
      try {
        const ok = await validateReferralCode(normalizedReferral);
        if (!alive) return;
        setRefState(ok ? "valid" : "invalid");
        setRefMsg(ok ? null : t("errors.referralInvalid"));
      } catch {
        if (!alive) return;
        setRefState("invalid");
        setRefMsg(t("errors.generic"));
      }
    }, 450);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [normalizedReferral, t]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await signUpInviteOnly({
        referralCode: normalizedReferral,
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
      });

      setDone({ checkEmail: !!res?.checkEmail });
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("referral")) setError(t("errors.referralInvalid"));
      else if (msg.toLowerCase().includes("email")) setError(t("errors.emailInUse"));
      else if (msg.toLowerCase().includes("username")) setError(t("errors.usernameTaken"));
      else setError(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md lg:max-w-lg mx-auto px-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
          <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
        </div>
        <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-[1.08]">
          {t("auth.signup.title")}
        </h1>
        <p className="mt-3 text-white/65 text-sm md:text-base max-w-[42ch] mx-auto">
          {t("auth.signup.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border-[#F0B90B]/20 bg-[#F0B90B]/8 p-4 mb-6">
        <div className="text-sm font-semibold text-white mb-1">
          {t("auth.signup.noticeTitle")}
        </div>
        <div className="text-xs text-white/70 leading-relaxed">
          {t("auth.signup.noticeDesc")}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/40 to-transparent" />
        {done ? (
          <div className="p-6 md:p-8">
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
                      className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/25 active:translate-y-[1px] flex items-center justify-center gap-2"
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
          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-4">
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
                    (refState === "valid" ? t("auth.signup.referralValid") : t("auth.signup.referralHint"))
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
                      ? usernameOk
                        ? t("auth.signup.usernameOk")
                        : t("auth.signup.usernameRules")
                      : t("auth.signup.usernameHint")
                  }
                  helperTone={username ? (usernameOk ? "ok" : "error") : "muted"}
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
                  type="password"
                  helper={t("auth.signup.passwordHint")}
                  helperTone="muted"
                />

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/25 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
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

          <div className="text-center text-sm pt-3">
            <span className="text-white/50">{t("auth.signup.haveAccount")}</span>{" "}
            <Link to={getLangPath(L, "/signin")} className="text-[#F0B90B] hover:underline font-medium">
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
      <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
        <div className="text-white/55 shrink-0">{icon}</div>
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
