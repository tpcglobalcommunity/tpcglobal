import { type Language, getLangPath, useI18n } from "../../i18n";
import { LayoutDashboard, Layers, Wallet, Settings } from "lucide-react";

type Item = { key: string; label: string; href: string; icon: any };

export default function MemberNav({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const base = `${getLangPath(lang, "")}/member`;
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  const items: Item[] = [
    { key: "dashboard", label: t("member.nav.dashboard") || "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { key: "programs", label: t("member.nav.programs") || "Programs", href: `${base}/programs`, icon: Layers },
    { key: "verify", label: t("member.nav.verify") || "Wallet", href: `${base}/verify`, icon: Wallet },
    { key: "settings", label: t("member.nav.settings") || "Settings", href: `${base}/settings`, icon: Settings },
  ];

  const isActive = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-20">
          <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-white font-semibold">
                {t("member.nav.title") || "Member Menu"}
              </div>
              <div className="text-xs text-white/45 mt-1">
                {t("member.nav.subtitle") || "Navigate your member area."}
              </div>
            </div>

            <div className="p-2">
              {items.map((i) => {
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
                      <div className={active ? "text-white font-medium" : "text-white/80"}>{i.label}</div>
                    </div>
                    {active ? <div className="w-1.5 h-6 rounded-full bg-[#F0B90B]" /> : null}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-white/40 px-2">
            {t("member.nav.footnote") || "Education-first. Risk-aware. No profit guarantees."}
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-3 left-0 right-0 z-50">
        <div className="mx-auto max-w-md px-3">
          <div className="rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <div className="grid grid-cols-4">
              {items.map((i) => {
                const Icon = i.icon;
                const active = isActive(i.href);
                return (
                  <a
                    key={i.key}
                    href={i.href}
                    className="py-3 flex flex-col items-center justify-center gap-1"
                  >
                    <Icon className={["w-5 h-5", active ? "text-[#F0B90B]" : "text-white/55"].join(" ")} />
                    <span className={["text-[11px]", active ? "text-white" : "text-white/55"].join(" ")}>
                      {i.label}
                    </span>
                    <span className={["h-1 w-1 rounded-full", active ? "bg-[#F0B90B]" : "bg-transparent"].join(" ")} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
