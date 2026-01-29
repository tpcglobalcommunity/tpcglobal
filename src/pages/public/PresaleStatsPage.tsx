import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { OfficialWalletsCard } from "@/components/trust/OfficialWalletsCard";
import { BarChart3 } from "lucide-react";
import { formatTpc, formatUsd, PRESALE_STAGES, DEX_REFERENCE_PRICE } from "@/lib/tokenSale";

const PresaleStatsPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("presale.title")}</h1>
          <p className="text-muted-foreground">{t("presale.subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Pricing Table */}
          <div className="card-premium p-6">
            <h3 className="font-semibold mb-4">{t("presale.pricingTitle")}</h3>
            <div className="space-y-4">
              {PRESALE_STAGES.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div>
                    <span className="font-medium">{t(stage.nameKey)}</span>
                    <p className="text-sm text-muted-foreground">{formatTpc(stage.supply)} TPC</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">{formatUsd(stage.priceUsd)}</span>
                    <p className="text-xs text-muted-foreground">per TPC</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-medium">{t("presale.dexReference")}</span>
                <span className="text-xl font-bold text-primary">{formatUsd(DEX_REFERENCE_PRICE)}</span>
              </div>
            </div>
          </div>

          {/* Progress bars - placeholder */}
          <div className="card-premium p-6">
            <h3 className="font-semibold mb-4">{t("presale.progressTitle")}</h3>
            {PRESALE_STAGES.map((stage) => (
              <div key={stage.id} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{t(stage.nameKey)}</span>
                  <span className="text-muted-foreground">0%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-0 transition-all" />
                </div>
              </div>
            ))}
          </div>

          <OfficialWalletsCard />
        </div>
      </div>
    </PremiumShell>
  );
};

export default PresaleStatsPage;
