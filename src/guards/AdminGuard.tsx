import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { type Language, getLangPath, useTranslations } from "../i18n";
import { PremiumShell, NoticeBox, PremiumButton } from "../components/ui";
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react";

type GuardState =
  | { status: "loading" }
  | { status: "allowed" }
  | { status: "unauthenticated" }
  | { status: "forbidden"; reason?: string };

type ProfileRow = {
  id: string;
  role: string | null;
  status?: string | null;
  verified?: boolean | null;
};

export default function AdminGuard({
  lang,
  children,
  allowRoles = ["super_admin", "admin"],
}: {
  lang: Language;
  children: React.ReactNode;
  allowRoles?: string[];
}) {
  const t = useTranslations();
  const [state, setState] = useState<GuardState>({ status: "loading" });

  const signinPath = useMemo(() => getLangPath() + "/signin", [lang]);
  const homePath = useMemo(() => getLangPath() + "/", [lang]);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setState({ status: "loading" });

        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        const session = sessionData.session;
        if (!session?.user?.id) {
          if (!alive) return;
          setState({ status: "unauthenticated" });
          return;
        }

        const userId = session.user.id;

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("id, role, status, verified")
          .eq("id", userId)
          .single<ProfileRow>();

        if (profileErr) {
          if (!alive) return;
          setState({ status: "forbidden", reason: profileErr.message });
          return;
        }

        const role = (profile?.role || "").toLowerCase();
        const ok = allowRoles.map(r => r.toLowerCase()).includes(role);

        if (!alive) return;
        if (!ok) {
          setState({ status: "forbidden", reason: `Role '${profile?.role}' not allowed` });
          return;
        }

        setState({ status: "allowed" });
      } catch (e: any) {
        if (!alive) return;
        setState({ status: "forbidden", reason: e?.message || "Unknown error" });
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  // Redirect if not logged in (client-side)
  useEffect(() => {
    if (state.status === "unauthenticated") {
      window.location.assign(signinPath);
    }
  }, [state.status, signinPath]);

  if (state.status === "loading") {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="h-8 w-48 rounded bg-white/10 animate-pulse mb-4" />
          <div className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
        </div>
      </PremiumShell>
    );
  }

  if (state.status === "forbidden") {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-4">
            <ShieldAlert className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm text-white/80">{t("admin.guard.badge", { defaultValue: "Admin Protected" })}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t("admin.guard.forbiddenTitle", { defaultValue: "Access denied" })}
          </h1>
          <p className="text-white/65 mb-6">
            {t("admin.guard.forbiddenDesc", { defaultValue: "You don't have permission to open this area." })}
          </p>

          <NoticeBox variant="warning">
            <div className="text-sm text-white/80">
              {t("admin.guard.reason", { defaultValue: "Reason:" })}{" "}
              <span className="text-white/70">{state.reason || "Not authorized"}</span>
            </div>
          </NoticeBox>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <PremiumButton>
              <a href={homePath} className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("admin.guard.backHome", { defaultValue: "Back to Home" })}
              </a>
            </PremiumButton>

            <PremiumButton variant="secondary">
              <a href={signinPath} className="inline-flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                {t("admin.guard.signin", { defaultValue: "Sign in with admin account" })}
              </a>
            </PremiumButton>
          </div>
        </div>
      </PremiumShell>
    );
  }

  // allowed
  return <>{children}</>;
}
