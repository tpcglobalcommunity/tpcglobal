import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Language, useTranslations, setLanguage, getLangPath } from '../i18n';
import { Link } from './Router';
import TPMonogram from './brand/TPMonogram';

interface AppHeaderProps {
  lang: Language;
  currentPath: string;
}

const AppHeader = ({ lang, currentPath }: AppHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations(lang);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('mobile-menu-state', { detail: { open: true } }));
    } else {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('mobile-menu-state', { detail: { open: false } }));
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: t.nav.home, path: getLangPath(lang, '/home') },
    { label: t.nav.docs, path: getLangPath(lang, '/docs') },
    { label: t.nav.dao, path: getLangPath(lang, '/dao') },
    { label: t.nav.transparency, path: getLangPath(lang, '/transparency') },
    { label: t.nav.fund, path: getLangPath(lang, '/fund') },
    { label: t.nav.legal, path: getLangPath(lang, '/legal') },
  ];

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang, currentPath);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 transition-all duration-300 ease-out before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-1/2 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#F0B90B]/30 before:to-transparent before:opacity-60 before:blur-[1px] ${
        scrolled
          ? 'h-12 bg-black/75 backdrop-blur-2xl shadow-lg shadow-black/30'
          : 'h-14 bg-black/60 backdrop-blur-2xl shadow-md shadow-black/10'
      }`}
    >
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/40 to-transparent"></div>

      <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center h-full gap-3">
          <Link
            to={getLangPath(lang, '/home')}
            className="relative flex items-center gap-2.5 group shrink-0"
            aria-label="TPC Home"
          >
            <div className="absolute -left-2 -top-2 w-16 h-16 bg-gradient-radial from-[#F0B90B]/15 via-transparent to-transparent blur-[80px] opacity-20"></div>

            <TPMonogram size={30} />

            <div className="flex flex-col min-w-0" style={{ gap: '1px' }}>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">TPC</span>
              <span className="hidden lg:block text-[10px] text-white/60 tracking-wide leading-none whitespace-nowrap">
                Trader Professional Community
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7" role="navigation">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-1 py-2 text-[13px] tracking-wide font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-[#F0B90B]/90 hover:-translate-y-[1px]'
                  }`}
                >
                  {item.label}
                  {isActive ? (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] w-full bg-[#F0B90B] rounded-full"
                      style={{
                        boxShadow: '0 0 8px rgba(240, 185, 11, 0.4), 0 0 3px rgba(240, 185, 11, 0.5)'
                      }}
                    ></span>
                  ) : (
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#F0B90B] rounded-full transition-all duration-200 group-hover:w-full group-hover:shadow-[0_0_8px_rgba(240,185,11,0.4)]"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 ml-auto shrink-0">
            <div className="flex items-center rounded-full bg-white/12 backdrop-blur-lg border border-white/15 p-[3px] shrink-0 transition-all duration-200 hover:border-[#F0B90B]/40 hover:-translate-y-[0.5px]">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-[#F0B90B] text-black shadow-lg shadow-[#F0B90B]/25'
                    : 'text-white/60 hover:text-white/80 hover:-translate-y-[0.5px]'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('id')}
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full transition-all duration-200 ${
                  lang === 'id'
                    ? 'bg-[#F0B90B] text-black shadow-lg shadow-[#F0B90B]/25'
                    : 'text-white/60 hover:text-white/80 hover:-translate-y-[0.5px]'
                }`}
                aria-label="Switch to Indonesian"
              >
                ID
              </button>
            </div>

            <a
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold rounded-full px-4 py-1.5 text-[12px] transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#F0B90B]/25 active:scale-[0.98] shrink-0"
            >
              Join Community
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/[0.08] transition-all duration-200 shrink-0"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="md:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[380px] max-h-[85vh] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[110] animate-[scaleIn_0.3s_ease-out] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B] to-[#f8d12f] rounded-xl blur-lg opacity-50"></div>
                  <TPMonogram size={24} />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">TPC</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/[0.08] transition-all duration-200"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1" role="navigation">
                {navItems.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-[#F0B90B] bg-[#F0B90B]/10 border border-[#F0B90B]/20'
                          : 'text-white/80 hover:bg-white/[0.05] hover:text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="sticky bottom-0 pt-4 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
              <div className="h-px bg-white/10 mb-4"></div>
              <a
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold rounded-2xl px-4 py-3 text-[14px] transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#F0B90B]/20"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Community
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default AppHeader;
