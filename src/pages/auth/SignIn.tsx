import React, { useMemo, useState } from "react";
import { Shield, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { signIn } from "../../lib/supabase";

interface SignInProps {
  lang?: Language;
}

function safeNext(nextRaw: string | null, fallback: string) {
  if (!nextRaw) return fallback;
  try {
    const decoded = decodeURIComponent(nextRaw);
    if (!decoded.startsWith("/")) return fallback;
    if (decoded.startsWith("//")) return fallback;
    if (decoded.includes("://")) return fallback;
    return decoded;
  } catch {
    return fallback;
  }
}

export default function SignIn({ lang }: SignInProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallback = getLangPath(L, "/member/dashboard");
  const next = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return safeNext(params.get("next"), fallback);
  }, [fallback]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      window.location.assign(next);
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.toLowerCase().includes("confirm")) setError(t("errors.emailNotConfirmed"));
      else setError(t("errors.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PremiumShell>
      <PremiumSection className="pt-10 md:pt-14 pb-32">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F0B90B]/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F0B90B]/8 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="relative max-w-md lg:max-w-lg mx-auto px-4">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
              <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
            </div>
            <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-tight">
              {t("auth.signin.title")}
            </h1>
            <p className="mt-3 text-white/65 text-sm md:text-base max-w-[42ch] mx-auto">
              {t("auth.signin.subtitle")}
            </p>
          </div>

          <NoticeBox
            title={t("auth.signin.noticeTitle")}
            description={t("auth.signin.noticeDesc")}
            className="rounded-2xl border-[#F0B90B]/20 bg-[#F0B90B]/8"
          />

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent" />
            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-5">
              <Field
                icon={<Mail className="w-4 h-4" />}
                label={t("auth.signin.email")}
                value={email}
                onChange={(v) => setEmail(v)}
                placeholder="name@email.com"
                type="email"
              />
              <Field
                icon={<Lock className="w-4 h-4" />}
                label={t("auth.signin.password")}
                value={password}
                onChange={(v) => setPassword(v)}
                placeholder="••••••••"
                type="password"
              />

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <PremiumButton className="w-full h-12" type="submit" disabled={submitting || !email.trim() || password.length < 1}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("auth.signin.signingIn")}
                  </>
                ) : (
                  <>
                    {t("auth.signin.signIn")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </PremiumButton>

              <div className="flex items-center justify-between gap-4 text-sm text-white/65 pt-2">
                <Link to={getLangPath(L, "/forgot")} className="hover:underline text-[#F0B90B] hover:text-[#F0B90B]/90 transition-colors">
                  {t("auth.signin.forgot")}
                </Link>
                <div className="text-right">
                  <span className="text-white/50">{t("auth.signin.noAccount")}</span>{" "}
                  <Link to={getLangPath(L, "/signup")} className="text-[#F0B90B] hover:underline font-medium">
                    {t("auth.signin.goSignup")}
                  </Link>
                </div>
              </div>
            </form>
          </div>
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
}) {
  const { icon, label, value, onChange, placeholder, type } = props;

  return (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-2.5">{label}</label>
      <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-2 focus-within:ring-[#F0B90B]/10 transition-all">
        <div className="text-white/55 shrink-0">{icon}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type || "text"}
          className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
