import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Clock, Shield, Users, ArrowRight, Home, ShoppingCart } from "lucide-react";

const MarketplacePage = () => {
  const { t, withLang } = useI18n();

  const features = [
    {
      icon: Store,
      title: t("marketplace.features.vendorTools"),
      description: t("marketplace.features.vendorToolsDesc"),
    },
    {
      icon: Shield,
      title: t("marketplace.features.listingProducts"),
      description: t("marketplace.features.listingProductsDesc"),
    },
    {
      icon: Users,
      title: t("marketplace.features.communityDeals"),
      description: t("marketplace.features.communityDealsDesc"),
    },
  ];

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary font-medium">{t("marketplace.comingSoon")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient-gold">
            {t("marketplace.title")}
          </h1>
          <p className="text-xl text-foreground max-w-2xl mx-auto">
            {t("marketplace.description")}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-premium">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t("marketplace.securityNote")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={withLang("/")}>
              <Button variant="outline" size="lg" className="min-w-[140px]">
                <Home className="h-4 w-4 mr-2" />
                {t("marketplace.backToHome")}
              </Button>
            </Link>
            <Link to={withLang("/buytpc")}>
              <Button size="lg" className="min-w-[140px]">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t("marketplace.buyTpc")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default MarketplacePage;
