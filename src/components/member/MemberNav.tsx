import { type Language, getLangPath, useI18n } from "@/i18n";
import { LayoutDashboard, Layers, Wallet, Settings, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { Link } from "../Router";

type Item = { key: string; label: string; href: string; icon: any; badge?: number };

export default function MemberNav({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const base = `${getLangPath(lang, "")}/member`;
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  // Get current user for realtime notifications
  const [userId, setUserId] = useState<string | null>(null);
  
  // Realtime notifications hook
  const { unreadCount, isConnected, error } = useRealtimeNotifications({
    userId: userId || undefined,
    enabled: !!userId
  });

  // Get current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    
    getSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const items: Item[] = [
    { key: "dashboard", label: t("member.nav.dashboard") || "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { key: "programs", label: t("member.nav.programs") || "Programs", href: `${base}/programs`, icon: Layers },
    { key: "verify", label: t("member.nav.verify") || "Wallet", href: `${base}/verify`, icon: Wallet },
    { key: "notifications", label: t("member.nav.notifications") || "Notifications", href: `${base}/notifications`, icon: Bell, badge: unreadCount },
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
                  <Link
                    key={i.key}
                    to={i.href}
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
                    <div className="flex items-center gap-2">
                      {i.badge && i.badge > 0 && (
                        <span className="px-2 py-1 text-xs bg-[#F0B90B]/20 text-[#F0B90B] rounded-full">
                          {i.badge > 99 ? "99+" : i.badge}
                        </span>
                      )}
                      {active ? <div className="w-1.5 h-6 rounded-full bg-[#F0B90B]" /> : null}
                    </div>
                  </Link>
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
                  <Link
                    key={i.key}
                    to={i.href}
                    className="py-3 flex flex-col items-center justify-center gap-1 relative"
                  >
                    <Icon className={["w-5 h-5", active ? "text-[#F0B90B]" : "text-white/55"].join(" ")} />
                    <span className={["text-[11px]", active ? "text-white" : "text-white/55"].join(" ")}>
                      {i.label}
                    </span>
                    {i.badge && i.badge > 0 && (
                      <span className="absolute top-2 right-4 px-1.5 py-0.5 text-xs bg-[#F0B90B]/20 text-[#F0B90B] rounded-full min-w-[16px] text-center">
                        {i.badge > 99 ? "99+" : i.badge}
                      </span>
                    )}
                    <span className={["h-1 w-1 rounded-full", active ? "bg-[#F0B90B]" : "bg-transparent"].join(" ")} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
