import { Language } from '../../i18n';
import AuthHeader from './AuthHeader';

interface AuthLayoutProps {
  lang: Language;
  children: React.ReactNode;
}

export default function AuthLayout({ lang, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <AuthHeader lang={lang} />

      <main className="flex-1 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#F0B90B]/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#F0B90B]/8 rounded-full blur-[140px] opacity-30" />
        </div>

        <div className="relative pt-10 md:pt-14 pb-28">
          {children}
        </div>
      </main>
    </div>
  );
}
