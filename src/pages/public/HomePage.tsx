import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { AntiScamBanner } from "@/components/security/AntiScamBanner";
import { Shield, BarChart3, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { t, withLang } = useI18n();

  const features = [
    { icon: Shield, key: "home.ctaVerified", path: "/verified" },
    { icon: BarChart3, key: "home.ctaPresale", path: "/presale-stats" },
    { icon: BookOpen, key: "home.ctaHowToBuy", path: "/how-to-buy-safely" },
    { icon: Users, key: "home.ctaTransparency", path: "/transparency" },
  ];

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* Hero */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs text-primary font-medium">{t("home.educationFirst")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold">
            {t("home.heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          <p className="text-foreground/80 max-w-xl mx-auto">
            {t("home.heroDescription")}
          </p>
        </div>

        {/* Anti-Scam Banner */}
        <div className="mb-12">
          <AntiScamBanner />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.path} to={withLang(feature.path)}>
                <div className="card-premium p-6 text-center hover:border-primary/40 transition-all group">
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{t(feature.key)}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-premium p-6 text-center">
            <Shield className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">{t("home.trustTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.trustDesc")}</p>
          </div>
          <div className="card-premium p-6 text-center">
            <BookOpen className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">{t("home.educationFirst")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.educationDesc")}</p>
          </div>
          <div className="card-premium p-6 text-center">
            <BarChart3 className="h-10 w-10 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">{t("home.noPromises")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.noPromisesDesc")}</p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default HomePage;
