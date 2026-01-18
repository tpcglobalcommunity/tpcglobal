import { Home, FileText, Users, Eye, DollarSign, Scale } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from './Router';
import { colors, transitions } from '../lib/designTokens';

interface BottomNavProps {
  lang: Language;
  currentPath: string;
}

const BottomNav = ({ lang, currentPath }: BottomNavProps) => {
  const t = useTranslations(lang);

  const navItems = [
    { label: t.nav.home, path: getLangPath(lang, '/home'), icon: Home },
    { label: t.nav.docs, path: getLangPath(lang, '/docs'), icon: FileText },
    { label: t.nav.dao, path: getLangPath(lang, '/dao'), icon: Users },
    { label: t.nav.transparency, path: getLangPath(lang, '/transparency'), icon: Eye },
    { label: t.nav.fund, path: getLangPath(lang, '/fund'), icon: DollarSign },
    { label: t.nav.legal, path: getLangPath(lang, '/legal'), icon: Scale },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-black/80 border-t border-white/10 z-50 h-[72px]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center px-2 h-full">
        {navItems.slice(0, 4).map((item) => {
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
