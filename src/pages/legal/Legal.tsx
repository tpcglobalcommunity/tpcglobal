import { FileText, Scale, Users } from 'lucide-react';
import { Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, NoticeBox, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

interface LegalProps {
  lang: Language;
}

const Legal = ({ lang }: LegalProps) => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6">
            <Scale className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              {t("legal.badge")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("legal.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            {t("legal.subtitle")}
          </p>
        </div>

        {/* Notice Card */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <NoticeBox variant="warning">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                {t("legal.noticeTitle")}
              </h3>
              <p className="text-white/90 leading-relaxed">
                {t("legal.noticeBody")}
              </p>
            </div>
          </NoticeBox>
        </div>

        {/* CTA Section */}
        <section className="text-center mb-16">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Get Started with TPC
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link to={getLangPath(lang, '/docs')}>
                <PremiumButton variant="secondary" size="sm" className="w-full">
                  <FileText className="w-5 h-5 mr-2" />
                  {t("legal.cta.docs")}
                </PremiumButton>
              </Link>
              
              <Link to={getLangPath(lang, '/transparency')}>
                <PremiumButton variant="secondary" size="sm" className="w-full">
                  <Scale className="w-5 h-5 mr-2" />
                  {t("legal.cta.transparency")}
                </PremiumButton>
              </Link>
              
              <PremiumButton 
                variant="primary" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  const telegramUrl = 'https://t.me/tpcglobalcommunity';
                  window.open(telegramUrl, '_blank');
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                {t("legal.cta.community")}
              </PremiumButton>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10">
          <p className="text-white/60 text-sm">
            {t("legal.footer")}
          </p>
        </footer>
      </div>
    </PremiumShell>
  );
};

export default Legal;
