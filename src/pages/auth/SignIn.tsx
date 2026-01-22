import React, { useMemo, useState } from "react";
import { Shield, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { signIn } from "../../lib/supabase";
import { useAuthError } from "../../hooks/useAuthError";

interface SignInProps {
  lang?: Language;
  next?: string;
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

export default function SignIn({ lang, next }: SignInProps) {
  const { t, language } = useI18n(lang || "en");
  const L = language;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { error, handleError, clearError } = useAuthError();

  const fallback = getLangPath(L, "/member/dashboard");
  const nextUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    return safeNext(nextParam, fallback);
  }, [fallback]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      window.location.assign(nextUrl);
    } catch (err: any) {
      handleError(err);
    } finally {
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
          {t("auth.signin.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/65 max-w-[42ch] mx-auto">
          {t("auth.signin.subtitle")}
        </p>
      </div>

      <div className="rounded-2xl border-[#F0B90B]/20 bg-[#F0B90B]/8 p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t("auth.signIn.title") || "Sign In"}</h2>
          <button
            onClick={() => window.location.href = `/${lang}`}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            {t("signup.backToHome") || "← Back to Home"}
          </button>
        </div>
        <div className="text-sm font-semibold text-white mb-1">
          {t("auth.signin.noticeTitle")}
        </div>
        <div className="text-xs text-white/70 leading-relaxed">
          {t("auth.signin.noticeDesc")}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(240,185,11,0.10),transparent_60%)]" />

        <form onSubmit={onSubmit} className="relative p-5 sm:p-6 space-y-4">
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
            className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
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

          <div className="text-xs text-white/45 text-center mt-3">
            {t("auth.reassurance")}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60 pt-3">
            <Link to={getLangPath(L, "/forgot")} className="text-[#F0B90B] hover:underline underline-offset-4 transition-colors">
              {t("auth.signin.forgot")}
            </Link>
            <div className="text-center sm:text-right">
              <span>{t("auth.signin.noAccount")}</span>{" "}
              <Link to={getLangPath(L, "/signup")} className="text-[#F0B90B] hover:underline underline-offset-4 font-medium">
                {t("auth.signin.createAccount")}
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
      </div>
    </div>
  );
}
