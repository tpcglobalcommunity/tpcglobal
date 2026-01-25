import { useState, useEffect } from "react";
import { Link, useNavigate } from "@/components/Router";
import { type Language, useI18n } from "@/i18n";
import { PremiumShell, PremiumCard } from "@/components/ui";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  Store, 
  ShoppingBag, 
  Settings, 
  Home,
  ChevronRight,
  LogOut
} from "lucide-react";

interface AdminLayoutProps {
  lang: Language;
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ lang, children, title }: AdminLayoutProps) {
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      href: `/${lang}/admin`,
    },
    {
      key: "members",
      label: "Members",
      icon: Users,
      href: `/${lang}/admin/members`,
    },
    {
      key: "vendors",
      label: "Vendors",
      icon: Store,
      href: `/${lang}/admin/vendors`,
    },
    {
      key: "marketplace",
      label: "Marketplace",
      icon: ShoppingBag,
      href: `/${lang}/admin/marketplace`,
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      href: `/${lang}/admin/settings`,
    },
  ];

  const getActiveKey = () => {
    const pathname = window.location.pathname;
    if (pathname.endsWith(`/${lang}/admin`) || pathname.endsWith(`/${lang}/admin/`)) return "overview";
    if (pathname.includes("/admin/members")) return "members";
    if (pathname.includes("/admin/vendors")) return "vendors";
    if (pathname.includes("/admin/marketplace")) return "marketplace";
    if (pathname.includes("/admin/settings")) return "settings";
    return "overview";
  };

  const activeKey = getActiveKey();

  const handleBackToSite = () => {
    navigate(`/${lang}`);
  };

  const handleSignOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
      navigate(`/${lang}`);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 w-72 h-full bg-gradient-to-b from-gray-900 to-black 
        border-r border-yellow-500/20 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-sm">TPC</span>
                </div>
                Admin
              </h1>
              <p className="text-gray-400 text-sm">Control Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 space-y-1">
            <button
              onClick={handleBackToSite}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Site</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {title || menuItems.find(item => item.key === activeKey)?.label || "Admin"}
                  </h2>
                  <p className="text-gray-400 text-sm">TPC Administration</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-400 text-sm font-medium">Admin Mode</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
