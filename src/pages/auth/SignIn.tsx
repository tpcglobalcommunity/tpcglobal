import React, { useMemo, useState } from "react";
import { Shield, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
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
    <div className="max-w-md lg:max-w-lg mx-auto px-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F0B90B]/10 blur-2xl" />
          <Shield className="w-7 h-7 text-[#F0B90B] relative z-10" />
        </div>
        <h1 className="mt-5 text-[clamp(2rem,8vw,3rem)] font-bold tracking-tight text-white leading-[1.08]">
          {t("auth.signin.title")}
        </h1>
        <p className="mt-3 text-white/65 text-sm md:text-base max-w-[42ch] mx-auto">
          {t("auth.signin.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border-[#F0B90B]/20 bg-[#F0B90B]/8 p-4 mb-6">
        <div className="text-sm font-semibold text-white mb-1">
          {t("auth.signin.noticeTitle")}
        </div>
        <div className="text-xs text-white/70 leading-relaxed">
          {t("auth.signin.noticeDesc")}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/40 to-transparent" />
        <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-4">
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

          <button
            type="submit"
            disabled={submitting || !email.trim() || password.length < 1}
            className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/25 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.signin.signingIn")}
              </>
            ) : (
              <>
                {t("auth.signin.signIn")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between gap-4 text-sm pt-3">
            <Link to={getLangPath(L, "/forgot")} className="text-[#F0B90B] hover:underline transition-colors">
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
      </div>
    </div>
  );
}
