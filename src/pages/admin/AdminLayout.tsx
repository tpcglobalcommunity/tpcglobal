import { useEffect, useState } from "react";
import { type Language, useI18n } from "../../i18n";
import { PremiumShell, NoticeBox } from "../../components/ui";
import { supabase } from "../../lib/supabase";
import AdminNav from "../../components/admin/AdminNav";

export default function AdminLayout({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  const { t } = useI18n(lang);
  const [role, setRole] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setRoleErr(null);
        const { data: ses } = await supabase.auth.getSession();
        const uid = ses.session?.user?.id;
        if (!uid) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .single();

        if (error) throw error;
        if (!alive) return;
        setRole((data?.role as string) || "member");
      } catch (e: any) {
        if (!alive) return;
        setRoleErr(e?.message || "Failed to load role");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <PremiumShell>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-28">
        <div className="mb-5">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
            {t("admin.title") || "Admin Control Center"}
          </h1>
          <p className="text-white/60 mt-2">
            {t("admin.subtitle") || "Manage members, referrals, roles, and transparency safely."}
          </p>
        </div>

        {roleErr ? (
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85">{roleErr}</div>
          </NoticeBox>
        ) : null}

        <div className="grid md:grid-cols-[280px,1fr] gap-4">
          <AdminNav lang={lang} role={role} />
          <div className="min-w-0">{children}</div>
        </div>

        <div className="mt-8 text-xs text-white/40">
          {t("admin.footer") || "Admin area is restricted. All actions are logged."}
        </div>
      </div>
    </PremiumShell>
  );
}
