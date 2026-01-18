import React, { useEffect, useMemo, useState } from "react";
import { Shield, KeyRound, Mail, User2, AtSign, Lock, Check, X, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
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
    <PremiumShell>
      <PremiumSection className="pt-8 md:pt-12 pb-24 md:pb-28">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
              <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-white">
              {t("auth.signup.title")}
            </h1>
            <p className="mt-2 text-white/65 text-sm md:text-base">
              {t("auth.signup.subtitle")}
            </p>
          </div>

          <NoticeBox
            title={t("auth.signup.noticeTitle")}
            description={t("auth.signup.noticeDesc")}
          />

          <PremiumCard className="mt-4 md:mt-6">
            {done ? (
              <div className="p-5 md:p-7">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 grid place-items-center">
                    <Check className="w-5 h-5 text-[#F0B90B]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white font-semibold">
                      {done.checkEmail ? t("auth.signup.checkEmailTitle") : t("auth.signup.successTitle")}
                    </h2>
                    <p className="text-white/65 mt-1 text-sm leading-relaxed">
                      {done.checkEmail ? t("auth.signup.checkEmailDesc") : t("auth.signup.successDesc")}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <Link to={getLangPath(L, "/signin")}>
                        <PremiumButton className="w-full" type="button">
                          {t("common.backToSignIn")}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </PremiumButton>
                      </Link>
                      <Link to={getLangPath(L, "/")}>
                        <PremiumButton className="w-full" variant="secondary" type="button">
                          {t("common.backHome")}
                        </PremiumButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="p-5 md:p-7 space-y-4">
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
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <PremiumButton className="w-full" type="submit" disabled={!canSubmit}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t("auth.signup.creating")}
                    </>
                  ) : (
                    <>
                      {t("auth.signup.createAccount")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </PremiumButton>

                <div className="text-center text-sm text-white/65">
                  {t("auth.signup.haveAccount")}{" "}
                  <Link to={getLangPath(L, "/signin")} className="text-[#F0B90B] hover:underline">
                    {t("auth.signup.goLogin")}
                  </Link>
                </div>
              </form>
            )}
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
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
      <label className="block text-sm font-semibold text-white/85 mb-2">{label}</label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 focus-within:border-[#F0B90B]/40 focus-within:bg-white/7 transition">
        <div className="text-white/60">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type || "text"}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-white/35 text-sm"
          autoComplete="off"
        />
        {right ? <div className="text-white/70">{right}</div> : null}
      </div>
      {helper ? <div className={`mt-2 text-xs ${helperClass}`}>{helper}</div> : null}
    </div>
  );
}
