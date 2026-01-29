import { AlertTriangle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { Button } from "@/components/ui/button";

export const AntiScamBanner = () => {
  const { t, withLang } = useI18n();

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-warning text-sm">
            {t("antiScam.bannerTitle")}
          </p>
          <p className="text-sm text-foreground/80 mt-1">
            {t("antiScam.bannerDesc")}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="flex-shrink-0">
          <Link to={withLang("/verified")}>
            <Shield className="h-4 w-4 mr-2" />
            {t("antiScam.bannerCta")}
          </Link>
        </Button>
      </div>
    </div>
  );
};
