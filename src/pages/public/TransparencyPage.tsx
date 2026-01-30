import { useI18n } from "@/i18n/i18n";
import { OfficialWalletsCard } from "@/components/trust/OfficialWalletsCard";
import { Eye, CheckCircle } from "lucide-react";

const TransparencyPage = () => {
  const { t } = useI18n();

  return (
    <div className="container-app section-spacing">
      <div className="text-center mb-8">
        <Eye className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("transparency.title")}</h1>
        <p className="text-muted-foreground">{t("transparency.subtitle")}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <h3 className="font-semibold mb-4 text-primary">{t("transparency.whatTitle")}</h3>
            <ul className="space-y-3">
              {["whatBullet1", "whatBullet2", "whatBullet3", "whatBullet4"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{t(`transparency.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-premium p-6">
            <h3 className="font-semibold mb-4 text-primary">{t("transparency.howTitle")}</h3>
            <ul className="space-y-3">
              {["howBullet1", "howBullet2", "howBullet3", "howBullet4"].map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{t(`transparency.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <OfficialWalletsCard />
      </div>
    </div>
  );
};

export default TransparencyPage;
