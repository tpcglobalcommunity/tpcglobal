import { Menu, X, Home, BookOpen, Shield, BadgeCheck, Wallet, Scale, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      document.body.setAttribute('data-menu-open', 'true');
      window.dispatchEvent(new CustomEvent('mobile-menu-state', { detail: { open: true } }));
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-menu-open');
      window.dispatchEvent(new CustomEvent('mobile-menu-state', { detail: { open: false } }));
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-menu-open');
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: t.nav.home, path: getLangPath(lang, '/home'), icon: Home },
    { label: t.nav.docs, path: getLangPath(lang, '/docs'), icon: BookOpen },
    { label: t.nav.dao, path: getLangPath(lang, '/dao'), icon: Shield },
    { label: t.nav.transparency, path: getLangPath(lang, '/transparency'), icon: BadgeCheck },
    { label: t.nav.fund, path: getLangPath(lang, '/fund'), icon: Wallet },
    { label: t.nav.legal, path: getLangPath(lang, '/legal'), icon: Scale },
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

      {mobileMenuOpen
        ? createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/90 z-[9999]"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Panel (bottom sheet) */}
              <div
                className="md:hidden fixed left-1/2 -translate-x-1/2 top-8 bottom-8 w-[86vw] max-w-[360px]
                           bg-[#0B0E11] z-[10000]
                           rounded-3xl border border-white/12 shadow-2xl shadow-black/70 overflow-hidden isolate"
                role="dialog"
                aria-modal="true"
              >
                {/* Premium highlight + depth layers */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F0B90B]/45 to-transparent" />
                <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] bg-[#F0B90B]/10 rounded-full blur-[140px] opacity-70 pointer-events-none" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-black/55" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

                {/* Handle */}
                <div className="absolute left-1/2 top-2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/10" />

                <div className="h-full flex flex-col min-h-0 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B] to-[#f8d12f] rounded-2xl blur-lg opacity-40" />
                        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-2">
                          <TPMonogram size={22} />
                        </div>
                      </div>
                      <div className="flex flex-col leading-none">
                        <span className="text-[15px] font-bold tracking-tight text-white">TPC</span>
                        <span className="text-[11px] text-white/50 tracking-wide mt-1">Navigation</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/85 hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nav */}
                  <nav className="flex-1 min-h-0 px-4 pt-3 pb-2 space-y-2 overflow-y-auto overflow-x-hidden mx-1 max-h-[52vh]">
                    {navItems.map((item) => {
                      const isActive = currentPath === item.path;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl mx-1
                            transition-all duration-200
                            ${isActive
                              ? 'bg-gradient-to-r from-[#F0B90B]/16 via-white/[0.06] to-transparent border border-[#F0B90B]/25 shadow-[0_14px_40px_rgba(0,0,0,0.45)]'
                              : 'bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/15'}
                          `}
                        >
                          {/* Left gold bar */}
                          <span
                            className={`absolute left-2 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-all duration-200
                              ${isActive
                                ? 'bg-[#F0B90B] shadow-[0_0_14px_rgba(240,185,11,0.35)]'
                                : 'bg-white/10 group-hover:bg-white/20'}
                            `}
                          />

                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`grid place-items-center w-8 h-8 rounded-xl border transition-all duration-200
                                ${isActive
                                  ? 'bg-[#F0B90B]/12 border-[#F0B90B]/25'
                                  : 'bg-white/[0.03] border-white/10 group-hover:bg-white/[0.06] group-hover:border-white/15'}
                              `}
                            >
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0B90B]' : 'text-white/70 group-hover:text-white/85'}`} />
                            </div>

                            <div className="min-w-0">
                              <div className={`text-[13px] font-semibold tracking-wide truncate ${isActive ? 'text-white' : 'text-white/85'}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-white/40 truncate">
                                {isActive ? 'You are here' : 'Open section'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#F0B90B] shadow-[0_0_10px_rgba(240,185,11,0.35)]' : 'bg-white/10 group-hover:bg-white/20'} transition-all duration-200`} />
                            <ChevronRight className={`w-4 h-4 transition-all duration-200 ${isActive ? 'text-white/70' : 'text-white/35 group-hover:text-white/60 group-hover:translate-x-[1px]'}`} />
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Footer CTA */}
                  <div
                    className="px-4 pt-2 pb-2 border-t border-white/10 bg-[#0B0E11]/92 backdrop-blur-xl shrink-0"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)' }}
                  >
                    <a
                      href="https://t.me/tpcglobalcommunity"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="relative overflow-hidden block text-center bg-gradient-to-r from-[#F0B90B] to-[#F8D568]
                                 text-black font-extrabold rounded-xl px-4 py-2.5 text-[13px]
                                 border border-black/10 shadow-2xl shadow-[#F0B90B]/25
                                 transition-all duration-200 active:scale-[0.98] hover:shadow-[#F0B90B]/35"
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-60" />
                      Join Community
                    </a>

                    <p className="mt-2 text-center text-[10px] text-white/45">
                      Education-first. Risk-aware. No guarantees.
                    </p>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </header>
  );
};

export default AppHeader;
