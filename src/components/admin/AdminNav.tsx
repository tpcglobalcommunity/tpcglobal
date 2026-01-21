import { useMemo } from "react";
import { type Language, getLangPath, useI18n } from "../../i18n";
import { LayoutDashboard, Users, Link2, ScrollText, Settings, BadgeCheck, Megaphone } from "lucide-react";
import type { AdminRole } from "../../hooks/useMyRole";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: any;
  minRole?: "viewer" | "admin" | "super_admin";
};

function roleRank(role: AdminRole) {
  if (role === "super_admin") return 3;
  if (role === "admin") return 2;
  if (role === "viewer") return 1;
  return 0;
}

export default function AdminNav({
  lang,
  role,
}: {
  lang: Language;
  role: AdminRole;
}) {
  const { t } = useI18n();
  const base = `${getLangPath(lang, "")}/admin`;

  const items: NavItem[] = useMemo(
    () => [
      {
        key: "dashboard",
        label: t("admin.nav.dashboard") || "Dashboard",
        href: `${base}/dashboard`,
        icon: LayoutDashboard,
        minRole: "viewer",
      },
      {
        key: "members",
        label: t("admin.nav.members") || "Members",
        href: `${base}/members`,
        icon: Users,
        minRole: "viewer",
      },
      {
        key: "referrals",
        label: t("admin.nav.referrals") || "Referrals",
        href: `${base}/referrals`,
        icon: Link2,
        minRole: "admin",
      },
      {
        key: "verification",
        label: t("admin.nav.verification") || "Verification",
        href: `${base}/verification`,
        icon: BadgeCheck,
        minRole: "admin",
      },
      {
        key: "broadcast",
        label: t("admin.nav.broadcast") || "Broadcast Center",
        href: `${base}/broadcast`,
        icon: Megaphone,
        minRole: "admin",
      },
      {
        key: "audit",
        label: t("admin.nav.audit") || "Audit Log",
        href: `${base}/audit`,
        icon: ScrollText,
        minRole: "viewer",
      },
      {
        key: "settings",
        label: t("admin.nav.settings") || "Settings",
        href: `${base}/settings`,
        icon: Settings,
        minRole: "super_admin",
      },
    ],
    [base, t]
  );

  const visible = useMemo(() => {
    const rr = roleRank(role);
    const need = (min?: NavItem["minRole"]) => {
      if (!min) return true;
      if (min === "viewer") return rr >= 1;
      if (min === "admin") return rr >= 2;
      if (min === "super_admin") return rr >= 3;
      return false;
    };
    return items.filter((i) => need(i.minRole));
  }, [items, role]);

  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <div className="grid gap-3">
      {/* Mobile tabs */}
      <div className="md:hidden -mx-1">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {visible.map((i) => {
            const Icon = i.icon;
            const active = isActive(i.href);
            return (
              <a
                key={i.key}
                href={i.href}
                className={[
                  "shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm",
                  active
                    ? "bg-[#F0B90B]/10 border-[#F0B90B]/25 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/20",
                ].join(" ")}
              >
                <Icon className={["w-4 h-4", active ? "text-[#F0B90B]" : "text-white/50"].join(" ")} />
                {i.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <div className="sticky top-20">
          <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-white font-semibold">
                {t("admin.nav.title") || "Admin Menu"}
              </div>
              <div className="text-xs text-white/55 mt-1">
                {t("admin.nav.role") || "Role"}: {role || "—"}
              </div>
            </div>

            <div className="p-2">
              {visible.map((i) => {
                const Icon = i.icon;
                const active = isActive(i.href);
                return (
                  <a
                    key={i.key}
                    href={i.href}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded-2xl border transition",
                      active
                        ? "bg-[#F0B90B]/10 border-[#F0B90B]/25"
                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "w-9 h-9 rounded-2xl flex items-center justify-center border",
                        active ? "bg-[#F0B90B]/10 border-[#F0B90B]/20" : "bg-white/5 border-white/10",
                      ].join(" ")}
                    >
                      <Icon className={["w-4 h-4", active ? "text-[#F0B90B]" : "text-white/55"].join(" ")} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={active ? "text-white font-medium" : "text-white/80"}>
                        {i.label}
                      </div>
                    </div>

                    {active ? (
                      <div className="w-1.5 h-6 rounded-full bg-[#F0B90B]" />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-white/45 px-2">
            {t("admin.nav.footnote") || "All actions are audited. Use admin access responsibly."}
          </div>
        </div>
      </div>
    </div>
  );
}
