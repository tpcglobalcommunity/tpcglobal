import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import { Home, FileText, Settings, Menu, X, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
}

const MemberShell = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/${lang}/login`);
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate(`/${lang}/login`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate(`/${lang}/login`);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t("member.nav.dashboard"),
      icon: Home,
      path: `/${lang}/member`
    },
    {
      id: 'invoices',
      label: t("member.nav.invoices"),
      icon: FileText,
      path: `/${lang}/member/invoices`
    },
    {
      id: 'settings',
      label: t("member.nav.settings"),
      icon: Settings,
      path: `/${lang}/member/settings`
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" 
           style={{
             backgroundColor: '#0B0F17',
             background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%)'
           }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-2 border-t-[#F0B90B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
            Loading...
          </h2>
          <p style={{ color: '#9CA3AF' }}>
            Please wait while we load your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" 
         style={{
           backgroundColor: '#0B0F17',
           background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%)'
         }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
           style={{
             backgroundColor: '#0F1624',
             border: '1px solid rgba(240,185,11,0.25)'
           }}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b" 
               style={{ borderColor: 'rgba(240,185,11,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
                <User className="w-5 h-5" style={{ color: '#F0B90B' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: '#E5E7EB' }}>
                  {user?.email?.split('@')[0]}
                </h3>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>
                  Member
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ color: '#9CA3AF' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${active 
                          ? 'bg-gradient-to-r from-[rgba(240,185,11,0.1)] to-transparent' 
                          : 'hover:bg-[rgba(255,255,255,0.05)]'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-[#F0B90B]' : 'text-[#9CA3AF]'}`} />
                      <span className={`font-medium ${active ? 'text-[#F0B90B]' : 'text-[#E5E7EB]'}`}>
                        {item.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-1 h-6 rounded-full bg-[#F0B90B]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(240,185,11,0.15)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-[rgba(239,68,68,0.1)]"
              style={{ color: '#EF4444' }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="bg-[#0F1624] border-b lg:hidden" 
                style={{ borderColor: 'rgba(240,185,11,0.15)' }}>
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ color: '#E5E7EB' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold" style={{ color: '#F0B90B' }}>
              {navItems.find(item => isActivePath(item.path))?.label || 'Member'}
            </h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberShell;
