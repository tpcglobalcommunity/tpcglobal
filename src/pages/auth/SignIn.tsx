import { useState, useMemo, useEffect } from "react";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useI18n, type Language, getLangPath } from "../../i18n";
import { Link } from "../../components/Router";
import { signIn } from "../../lib/supabase";
import { useAuthError } from "../../hooks/useAuthError";
import AuthShell from "../../components/auth/AuthShell";
import { AuthBuildMarker } from "../../components/auth/AuthBuildMarker";
import { getAuthState, getAuthRedirectPath, getLanguageFromPath } from "../../lib/authGuards";

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
  const { t, language } = useI18n();
  const L = language;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { error, handleError, clearError } = useAuthError();

  // Check auth state and redirect if needed
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const authState = await getAuthState();
      const currentLang = getLanguageFromPath(window.location.pathname);
      
      if (authState.isAuthed && authState.isEmailVerified) {
        // Already verified - redirect to update-profit
        const redirectPath = getAuthRedirectPath(authState, currentLang);
        window.location.assign(redirectPath);
        return;
      }
      
      if (authState.isAuthed && !authState.isEmailVerified) {
        // Logged in but not verified - redirect to verify
        const verifyPath = `/${currentLang}/verify`;
        window.location.assign(verifyPath);
        return;
      }
    };

    checkAuthAndRedirect();
  }, []);

  const fallback = getLangPath(L, "/member/update-profit");
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
      const result = await signIn({ email: email.trim(), password });
      
      if (result.needsVerification) {
        // Redirect to email verification page
        const verifyUrl = `${getLangPath(L, "/verify")}?email=${encodeURIComponent(email.trim())}`;
        window.location.assign(verifyUrl);
        return;
      }
      
      // Email is verified, proceed to update-profit
      window.location.assign(nextUrl);
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell 
      lang={lang}
      title="Sign In"
      subtitle="Welcome back to TPC"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2.5">
            Email
          </label>
          <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
            <Mail className="w-4 h-4 text-white/50 shrink-0" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              type="email"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2.5">
            Password
          </label>
          <div className="flex items-center gap-3 h-12 rounded-2xl border border-white/10 bg-white/5 px-4 hover:border-white/15 focus-within:border-[#F0B90B]/45 focus-within:bg-white/7 focus-within:ring-1 focus-within:ring-[#F0B90B]/25 transition-all">
            <Lock className="w-4 h-4 text-white/50 shrink-0" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••••"
              type="password"
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30 text-sm"
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Error Display */}
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !email.trim() || password.length < 1}
          className="w-full h-12 rounded-2xl font-semibold bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black transition-all duration-200 hover:shadow-lg hover:shadow-[#F0B90B]/20 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60 mt-6">
        <Link to={getLangPath(L, "/forgot")} className="text-[#F0B90B] hover:underline underline-offset-4 transition-colors">
          Forgot password?
        </Link>
        <div className="text-center sm:text-right">
          <span>Don't have an account?</span>{" "}
          <Link to={getLangPath(L, "/signup")} className="text-[#F0B90B] hover:underline underline-offset-4 font-medium">
            Create account
          </Link>
        </div>
      </div>
      
      <AuthBuildMarker />
    </AuthShell>
  );
}
