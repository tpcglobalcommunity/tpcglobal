import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { AntiScamBanner } from "@/components/security/AntiScamBanner";
import { Shield, BookOpen, Users, CheckCircle, XCircle, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HomePage = () => {
  const { t, withLang } = useI18n();

  const features = [
    { icon: Shield, key: "home.ctaVerified", path: "/verified" },
    { icon: BookOpen, key: "home.ctaHowToBuy", path: "/how-to-buy-safely" },
    { icon: Users, key: "home.ctaTransparency", path: "/transparency" },
  ];

  return (
    <div className="container-app section-spacing">
      <div className="container-app section-spacing">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-xs text-primary font-medium">{t("home.trustBadges.educationOnly")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold">
            {t("home.heroTitle")}
          </h1>
          <p className="text-xl text-foreground max-w-2xl mx-auto">
            {t("home.heroSubtitle")}
          </p>
          <p className="text-foreground/80 max-w-xl mx-auto">
            {t("home.heroDescription")}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={withLang("/buytpc")}>
              <Button size="lg" className="min-w-[140px]">
                {t("home.ctaBuyTpc")}
              </Button>
            </Link>
            <Link to={withLang("/verified")}>
              <Button variant="outline" size="lg" className="min-w-[140px]">
                {t("home.ctaVerified")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Trust Pillars */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card-premium p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t("home.trustBadges.educationOnly")}</h3>
              <p className="text-sm text-muted-foreground">Fokus edukasi trading tanpa janji profit</p>
            </div>
            <div className="card-premium p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t("home.trustBadges.transparent")}</h3>
              <p className="text-sm text-muted-foreground">Transparansi on-chain untuk semua transaksi</p>
            </div>
            <div className="card-premium p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{t("home.trustBadges.noProfitGuarantee")}</h3>
              <p className="text-sm text-muted-foreground">Tidak ada jaminan profit atau return</p>
            </div>
          </div>
        </div>

        {/* Anti-Scam Banner */}
        <div className="mb-12">
          <AntiScamBanner />
        </div>

        {/* What is TPC */}
        <div className="mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-6 text-gradient-gold">{t("home.whatIsTpcTitle")}</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {t("home.whatIsTpcDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* TPC IS / IS NOT */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card-premium p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-500">{t("home.tpcIsTitle")}</h3>
              <ul className="space-y-3">
                {[
                  "Education & community",
                  "Utility-based ecosystem", 
                  "Transparent on-chain system"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-premium p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-500">{t("home.tpcIsNotTitle")}</h3>
              <ul className="space-y-3">
                {[
                  "Investment scheme",
                  "Profit guarantee program",
                  "Money game / ponzi"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TPC Token */}
        <div className="mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="card-premium p-6 text-center">
              <Coins className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4 text-gradient-gold">{t("home.tokenTitle")}</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {t("home.tokenDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Presale Info */}
        <div className="mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="card-premium p-6">
              <h2 className="text-2xl font-bold mb-6 text-center text-gradient-gold">{t("home.presaleTitle")}</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-lg font-semibold text-primary">{t("home.presaleStage1")}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-primary">{t("home.presaleStage2")}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-primary">{t("home.presalePlannedPrice")}</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">{t("home.presaleNote")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
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

        {/* Final Disclaimer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t("home.disclaimer")}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
