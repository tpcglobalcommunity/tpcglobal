import { Language, getLangPath, stripLang, storeLanguage } from '../../i18n';
import { Link } from '../Router';
import TPMonogram from '../brand/TPMonogram';

interface AuthHeaderProps {
  lang: Language;
}

export default function AuthHeader({ lang }: AuthHeaderProps) {
  const handleLanguageChange = (newLang: Language) => {
    // Prevent unnecessary navigation
    if (newLang === lang) return;
    
    // Get current path without language prefix
    const currentPath = window.location.pathname;
    const basePath = stripLang(currentPath) || '/home';
    
    // Build new path with target language
    const newPath = `/${newLang}${basePath === '/' ? '' : basePath}`;
    
    // Preserve query string and hash
    const fullPath = newPath + window.location.search + window.location.hash;
    
    // Store language preference in localStorage
    storeLanguage(newLang);
    
    // Navigate to new path
    window.location.href = fullPath;
  };

  return (
    <header className="sticky top-0 z-50 h-12 md:h-14 border-b border-white/10 bg-black/55 backdrop-blur-xl">
      <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#F0B90B]/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link
          to={getLangPath(lang, '/home')}
          className="flex items-center gap-2.5 group"
          aria-label="TPC Home"
        >
          <TPMonogram size={26} />
          <div className="flex flex-col" style={{ gap: '1px' }}>
            <span className="text-base font-bold tracking-tight text-white">TPC</span>
            <span className="hidden sm:block text-[10px] text-white/60 tracking-wide leading-none">
              Trader Professional Community
            </span>
          </div>
        </Link>

        <div className="relative z-50 flex items-center rounded-full bg-white/12 backdrop-blur-lg border border-white/15 p-[3px] shrink-0 transition-all duration-200 hover:border-[#F0B90B]/40 hover:-translate-y-[0.5px] pointer-events-auto">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`relative z-50 px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full transition-all duration-200 pointer-events-auto ${
              lang === 'en'
                ? 'bg-[#F0B90B] text-black shadow-lg shadow-[#F0B90B]/25'
                : 'text-white/60 hover:text-white/80 hover:-translate-y-[0.5px]'
            }`}
            aria-label="Switch to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('id')}
            className={`relative z-50 px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full transition-all duration-200 pointer-events-auto ${
              lang === 'id'
                ? 'bg-[#F0B90B] text-black shadow-lg shadow-[#F0B90B]/25'
                : 'text-white/60 hover:text-white/80 hover:-translate-y-[0.5px]'
            }`}
            aria-label="Switch to Indonesian"
          >
            ID
          </button>
        </div>
      </div>
    </header>
  );
}
