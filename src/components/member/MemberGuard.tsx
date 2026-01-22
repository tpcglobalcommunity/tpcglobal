import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, getLangPath } from "../../i18n";
import MemberPendingPage from "../../pages/member/MemberPendingPage";
import MemberBannedPage from "../../pages/member/MemberBannedPage";

type Status = "VERIFIED" | "PENDING" | "BANNED" | string;

export default function MemberGuard({
  lang,
  allowPending = false,
  children,
}: {
  lang: Language;
  allowPending?: boolean;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: ses } = await supabase.auth.getSession();
      const uid = ses.session?.user?.id;
      if (!uid) {
        window.location.href = `${getLangPath(lang, "")}/signin`;
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("verified")
        .eq("id", uid)
        .single();

      if (!alive) return;

      if (error) {
        // fail-safe: treat as pending (limited)
        setStatus("PENDING");
        return;
      }
      setStatus((data?.verified ? "VERIFIED" : "PENDING") as Status);
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!status) return null;

  const s = String(status).toUpperCase();
  if (s === "BANNED") return <MemberBannedPage lang={lang} />;
  if (s === "PENDING" && !allowPending) return <MemberPendingPage lang={lang} />;

  return <>{children}</>;
}
