import { useI18n } from "@/i18n/i18n";
import { ShoppingCart } from "lucide-react";

const MarketplaceComingSoon = () => {
  const { t } = useI18n();

  return (
    <div className="container-app section-spacing">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-6">
          <ShoppingCart className="h-16 w-16 mx-auto text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">
          {t("marketplace.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("marketplace.comingSoonBody")}
        </p>
      </div>
    </div>
  );
};

export default MarketplaceComingSoon;
