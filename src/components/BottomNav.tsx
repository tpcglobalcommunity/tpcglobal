import { Home, FileText, Users, Eye, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from './Router';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  lang: Language;
  currentPath: string;
}

const BottomNav = ({ lang, currentPath }: BottomNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations(lang);
  const { profile } = useAuth();

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

  useEffect(() => {
    const handleMenuState = (event: CustomEvent) => {
      setIsMenuOpen(event.detail.open);
    };
    window.addEventListener('mobile-menu-state', handleMenuState as EventListener);
    return () => {
      window.removeEventListener('mobile-menu-state', handleMenuState as EventListener);
    };
  }, []);

  const navItems = [
    { label: t.nav.home, path: getLangPath(lang, '/home'), icon: Home },
    { label: t.nav.docs, path: getLangPath(lang, '/docs'), icon: FileText },
    { label: t.nav.dao, path: getLangPath(lang, '/dao'), icon: Users },
    { label: t.nav.transparency, path: getLangPath(lang, '/transparency'), icon: Eye },
    ...(isAdmin ? [
      { label: t.nav.admin, path: getLangPath(lang, '/admin/control'), icon: Shield }
    ] : [])
  ];

  if (isMenuOpen) {
    return null;
  }

  return (
    <nav
      className="bottom-nav xl:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/80 border-t border-white/10 z-50 transition-all duration-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center px-2 h-[72px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-[#F0B90B]'
                  : 'text-white/55 active:scale-95'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#F0B90B] rounded-full"></span>
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
