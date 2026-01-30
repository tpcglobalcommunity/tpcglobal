import { ReactNode } from "react";
import { useI18n } from "@/i18n/i18n";
import { Clock } from "lucide-react";

interface ComingSoonPageProps {
  titleKey: string;
  icon?: ReactNode;
}

export const ComingSoonPage = ({ titleKey, icon }: ComingSoonPageProps) => {
  const { t } = useI18n();

  return (
    <div className="container-app section-spacing">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-6">
          {icon || <Clock className="h-16 w-16 mx-auto text-primary" />}
        </div>
        <h1 className="text-2xl font-bold text-gradient-gold mb-4">
          {t(titleKey)}
        </h1>
        <p className="text-muted-foreground">
          {t("comingSoon.body")}
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;
