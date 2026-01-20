import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { getMyProfile } from "../../lib/supabase";
import { Link } from "../Router"; // kalau kamu pakai router custom
// atau gunakan navigate sesuai router kamu

type Props = {
  children: React.ReactNode;
  lang: any;
};

export default function MemberGate({ children, lang }: Props) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState<null | "login" | "complete">(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!alive) return;
          setBlocked("login");
          setLoading(false);
          return;
        }

        const profile = await getMyProfile();

        // Kalau profile belum ada (fail-open trigger gagal), arahkan ke complete profile
        if (!profile || profile.profile_completed !== true) {
          if (!alive) return;
          setBlocked("complete");
          setLoading(false);
          return;
        }

        if (!alive) return;
        setBlocked(null);
        setLoading(false);
      } catch {
        if (!alive) return;
        // kalau error baca profile, lebih aman kita blok ke complete
        setBlocked("complete");
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

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
