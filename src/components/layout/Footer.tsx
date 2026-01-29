import { useI18n } from "@/i18n/i18n";

export const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container-app py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">TPC</span>
            </div>
            <span className="font-bold text-gradient-gold">TPC Global</span>
          </div>
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
