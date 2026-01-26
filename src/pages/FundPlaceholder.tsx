import { ArrowLeft, Clock } from 'lucide-react';
import { useI18n } from "@/i18n";
import { PremiumShell, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

const FundPlaceholder = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 mb-8">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              Coming Soon
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("placeholder.notAvailable.title")}
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("placeholder.notAvailable.subtitle")}
          </p>
          
          <Link to="/">
            <PremiumButton variant="primary" size="sm" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              {t("placeholder.notAvailable.backToHome")}
            </PremiumButton>
          </Link>
        </div>
      </div>
    </PremiumShell>
  );
};

export default FundPlaceholder;
