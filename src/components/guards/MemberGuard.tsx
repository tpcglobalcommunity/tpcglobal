import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "../Router"; // kalau kamu pakai router custom
import type { Language } from "../../i18n";
import { computeProfileCompletion } from "../../lib/profileHelpers";
// atau gunakan navigate sesuai router kamu

type Props = {
  children: React.ReactNode;
  lang?: Language; // opsional, untuk override auto-detection
};

export default function MemberGate({ children, lang: propLang }: Props) {
  const { loading, profile } = useAuth();
  const [blocked, setBlocked] = useState<null | "login" | "verify" | "complete">(null);
  const [lang, setLang] = useState(propLang || 'en');

  useEffect(() => {
    // Gunakan prop lang jika ada, otherwise auto-detect dari path
    if (propLang) {
      setLang(propLang);
      return;
    }
    
    // Get language from current path
    const pathLang = window.location.pathname.split('/')[1];
    if (pathLang === 'en' || pathLang === 'id') {
      setLang(pathLang);
    }
  }, [propLang]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!alive) return;
          setBlocked("login");
          return;
        }

        // Check email verification FIRST
        const isVerified = Boolean(session.user.email_confirmed_at || session.user.confirmed_at);
        if (!isVerified) {
          if (!alive) return;
          setBlocked("verify");
          return;
        }

        // Use profile from useAuth
        if (!profile || !computeProfileCompletion(profile).isComplete) {
          if (!alive) return;
          setBlocked("complete");
          return;
        }

        if (!alive) return;
        setBlocked(null);
      } catch {
        if (!alive) return;
        // kalau error baca profile, lebih aman kita blok ke complete
        setBlocked("complete");
      }
    })();

    return () => { alive = false; };
  }, [profile]);

  if (loading) {
    return <div className="p-6 text-white/70">Loading...</div>;
  }

  if (blocked === "login") {
    return (
      <div className="p-6 text-white/80">
        <div className="mb-3 font-semibold">You need to sign in first.</div>
        <Link to={`/${lang}/signin`} className="text-[#F0B90B]">Go to Sign In</Link>
      </div>
    );
  }

  if (blocked === "verify") {
    return (
      <div className="p-6 text-white/80">
        <div className="mb-3 font-semibold">Please verify your email first.</div>
        <div className="text-white/60 mb-4">
          Check your inbox and click the verification link to continue.
        </div>
        <Link to={`/${lang}/verify-email`} className="text-[#F0B90B]">
          Verify Email →
        </Link>
      </div>
    );
  }

  if (blocked === "complete") {
    return (
      <div className="p-6 text-white/80">
        <div className="mb-2 font-semibold">Complete your profile to continue.</div>
        <div className="text-white/60 mb-4">
          Full name, phone, Telegram, and city are required before accessing Member Area.
        </div>
        <Link to={`/${lang}/member/complete-profile`} className="text-[#F0B90B]">
          Complete Profile →
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
