import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { Home, Shield, Store, ShoppingCart, User } from "lucide-react";

const navItems = [
  { key: "nav.home", path: "/", icon: Home },
  { key: "nav.verified", path: "/verified", icon: Shield },
  { key: "nav.marketplace", path: "/marketplace", icon: Store },
  { key: "nav.buyTpc", path: "/buytpc", icon: ShoppingCart },
  { key: "nav.login", path: "/login", icon: User },
];

export const BottomNav = () => {
  const { t, lang, withLang } = useI18n();
  const location = useLocation();

  const isActive = (path: string) => {
    const currentPath = location.pathname.replace(`/${lang}`, "") || "/";
    return currentPath === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border lg:hidden pb-safe">
      <div className="grid grid-cols-5 h-16">
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
              <span className="text-[10px] font-medium truncate max-w-[60px]">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
