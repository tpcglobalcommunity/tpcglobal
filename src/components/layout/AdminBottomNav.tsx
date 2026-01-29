import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { key: "adminNav.dashboard", path: "/admin", icon: LayoutDashboard },
  { key: "adminNav.invoices", path: "/admin/invoices", icon: FileText },
  { key: "adminNav.settings", path: "/admin/settings", icon: Settings },
];

export const AdminBottomNav = () => {
  const { t, lang, withLang } = useI18n();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(`/${lang}`, "") || "/";
    return currentPath === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden pb-safe">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={withLang(item.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium truncate">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut()}
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("common.logout")}</span>
        </button>
      </div>
    </nav>
  );
};
