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
      <PremiumSection className="pt-8 md:pt-12 pb-24 md:pb-28">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
              <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-white">
              {t("auth.signin.title")}
            </h1>
            <p className="mt-2 text-white/65 text-sm md:text-base">
              {t("auth.signin.subtitle")}
            </p>
          </div>

          <NoticeBox
            title={t("auth.signin.noticeTitle")}
            description={t("auth.signin.noticeDesc")}
          />

          <PremiumCard className="mt-4 md:mt-6">
            <form onSubmit={onSubmit} className="p-5 md:p-7 space-y-4">
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
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <PremiumButton className="w-full" type="submit" disabled={submitting || !email.trim() || password.length < 1}>
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

              <div className="flex items-center justify-between text-sm text-white/65">
                <Link to={getLangPath(L, "/forgot")} className="hover:underline text-[#F0B90B]">
                  {t("auth.signin.forgot")}
                </Link>
                <div>
                  {t("auth.signin.noAccount")}{" "}
                  <Link to={getLangPath(L, "/signup")} className="text-[#F0B90B] hover:underline">
                    {t("auth.signin.goSignup")}
                  </Link>
                </div>
              </div>
            </form>
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
}) {
  const { icon, label, value, onChange, placeholder, type } = props;

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
      </div>
    </div>
  );
}
