import { Home, BookOpen, Shield, BadgeCheck, Wallet, Scale, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Language, useTranslations, setLanguage, getLangPath } from '../i18n';
import { Link } from './Router';
import TPMonogram from './brand/TPMonogram';
import { HeaderAuthActions } from './auth/HeaderAuthActions';

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
    { label: t.nav.marketplace, path: getLangPath(lang, '/marketplace'), icon: Store },
    { label: t.nav.transparency, path: getLangPath(lang, '/transparency'), icon: BadgeCheck },
    { label: t.nav.fund, path: getLangPath(lang, '/fund'), icon: Wallet },
    { label: t.nav.legal, path: getLangPath(lang, '/legal'), icon: Scale },
  ];

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang, currentPath);
  };

  return (
    <>
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

          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold" role="navigation">
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
            <div className="hidden xl:block">
              <HeaderAuthActions lang={lang} />
            </div>

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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center shrink-0"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen
        ? createPortal(
            <>
              {/* Overlay */}
              <div
                className="xl:hidden fixed inset-0 bg-black/60 z-[9999]"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Right-side drawer */}
              <div
                className="xl:hidden fixed top-0 right-0 h-full w-[88%] max-w-sm border-l border-white/10 bg-black/80 backdrop-blur-xl z-[10000] overflow-y-auto"
                role="dialog"
                aria-modal="true"
              >
                <div className="p-4">
                  {/* AUTH BLOCK */}
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4 mb-4">
                    <div className="text-xs uppercase tracking-wide text-white/60 mb-3">
                      Member Access
                    </div>
                    <HeaderAuthActions
                      lang={lang}
                      variant="mobileMenu"
                      onAfterAction={() => setMobileMenuOpen(false)}
                    />
                  </div>

                  {/* NAV LINKS - Premium card style */}
                  <div className="grid gap-2">
                    {navItems.map((item) => {
                      const isActive = currentPath === item.path;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`rounded-2xl px-4 py-3 border transition-all duration-200 flex items-center gap-3 ${
                            isActive
                              ? 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-white'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/85'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-[#F0B90B]' : 'text-white/70'}`} />
                          <span className="font-semibold">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Community CTA */}
                  <a
                    href="https://t.me/tpcglobalcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-4 relative overflow-hidden block text-center bg-gradient-to-r from-[#F0B90B] to-[#F8D568]
                               text-black font-extrabold rounded-2xl px-4 py-3 text-sm
                               border border-black/10 shadow-lg shadow-[#F0B90B]/25
                               transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-60" />
                    Join Community
                  </a>

                  <p className="mt-3 text-center text-xs text-white/45">
                    Education-first. Risk-aware. No guarantees.
                  </p>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </header>
    </>
  );
};

export default AppHeader;
