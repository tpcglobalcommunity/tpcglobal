import { useI18n } from "@/i18n/i18n";
import { BrandLogo } from "@/components/brand/BrandLogo";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container-app py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo size="sm" withText={true} />
          <p className="text-sm text-muted-foreground max-w-md">
            {t("footer.disclaimer")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.officialDomain")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};
