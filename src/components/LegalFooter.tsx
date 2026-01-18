import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from './Router';
import TPMonogram from './brand/TPMonogram';

interface LegalFooterProps {
  lang: Language;
}

const LegalFooter = ({ lang }: LegalFooterProps) => {
  const t = useTranslations(lang);
  const currentYear = new Date().getFullYear();
  const copyrightText = lang === 'en'
    ? `© ${currentYear} TPC. All rights reserved.`
    : `© ${currentYear} TPC. Hak cipta dilindungi.`;

  return (
    <footer
      className="relative bg-black/60 border-t border-white/10 mt-0 backdrop-blur-2xl overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent"></div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,185,11,0.08),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2)_0%,transparent_100%)] pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-5 md:pt-6 pb-3 md:pb-4">
          <div className="relative opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-radial from-[#F0B90B]/15 via-transparent to-transparent blur-[100px] opacity-20"></div>

            <div className="relative flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B] to-[#f8d12f] rounded-xl blur-lg opacity-50"></div>
                <TPMonogram size={28} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">TPC</span>
            </div>
            <p className="text-xs text-white/65 mb-0.5 font-medium">{t.footer.brand}</p>
            <p className="text-xs text-white/50 leading-relaxed max-w-[38ch]">{t.footer.tagline}</p>
          </div>

          <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.1s_forwards]">
            <div className="mb-2">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70 mb-1.5">{t.footer.quickLinks}</h3>
              <div className="w-10 h-[2px] bg-gradient-to-r from-[#F0B90B] to-transparent opacity-90 blur-[1px]"></div>
            </div>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to={getLangPath(lang, '/home')}
                  className="group relative flex items-center text-[13px] text-white/70 hover:text-white transition-all duration-200"
                >
                  <span className="absolute -left-3 w-1 h-1 rounded-full bg-[#F0B90B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-[3px] transition-transform duration-200">{t.footer.links.home}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getLangPath(lang, '/docs')}
                  className="group relative flex items-center text-[13px] text-white/70 hover:text-white transition-all duration-200"
                >
                  <span className="absolute -left-3 w-1 h-1 rounded-full bg-[#F0B90B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-[3px] transition-transform duration-200">{t.footer.links.docs}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getLangPath(lang, '/transparency')}
                  className="group relative flex items-center text-[13px] text-white/70 hover:text-white transition-all duration-200"
                >
                  <span className="absolute -left-3 w-1 h-1 rounded-full bg-[#F0B90B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-[3px] transition-transform duration-200">{t.footer.links.transparency}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
            <div className="mb-2">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70 mb-1.5">{t.footer.links.community}</h3>
              <div className="w-10 h-[2px] bg-gradient-to-r from-[#F0B90B] to-transparent opacity-90 blur-[1px]"></div>
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://t.me/tpcglobalcommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center text-[13px] text-white/70 hover:text-white transition-all duration-200"
                >
                  <span className="absolute -left-3 w-1 h-1 rounded-full bg-[#F0B90B] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                  <span className="group-hover:translate-x-[3px] transition-transform duration-200">{t.footer.links.telegram}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-2 pt-2 border-t border-white/10">
          <div className="absolute left-1/2 -translate-x-1/2 -top-px w-[180px] h-[1px] bg-[#F0B90B]/50 blur-[2px]"></div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-px w-[180px] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
          <div className="absolute left-1/2 -translate-x-1/2 -top-px w-[80px] h-[1px] bg-[#F0B90B]/80 animate-[shimmer_3s_ease-in-out_infinite]"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-2 pb-2">
            <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3">
              <p className="text-[10px] text-white/60 font-medium tracking-wide">{copyrightText}</p>
              <div className="hidden md:flex items-center gap-2.5 text-[10px] text-white/45 tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#F0B90B]/60"></span>
                <span>Education First</span>
                <span className="w-1 h-1 rounded-full bg-[#F0B90B]/60"></span>
                <span>Transparency</span>
                <span className="w-1 h-1 rounded-full bg-[#F0B90B]/60"></span>
                <span>DAO Driven</span>
              </div>
            </div>
            <p className="text-[10px] text-white/45 tracking-wide">{t.footer.madeWith}</p>
          </div>
        </div>

        <div className="h-20 md:h-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}></div>
      </div>
    </footer>
  );
};

export default LegalFooter;
