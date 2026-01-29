import { useI18n } from "@/i18n/i18n";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { OfficialWalletsCard } from "@/components/trust/OfficialWalletsCard";
import { AddressPreviewCard } from "@/components/security/AddressPreviewCard";
import { AlertTriangle, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const VerifiedPage = () => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("verified.title")}</h1>
          <p className="text-muted-foreground">{t("verified.subtitle")}</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          <AddressPreviewCard />
          
          {/* Warnings */}
          <div className="card-premium border-warning/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">{t("verified.warningTitle")}</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>{t("verified.warning1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>{t("verified.warning2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>{t("verified.warning3")}</span>
              </li>
            </ul>
          </div>

          {/* Anti-Scam FAQ */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t("antiScam.faqTitle")}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="faq1" className="card-premium px-4">
                <AccordionTrigger>{t("antiScam.faq1Q")}</AccordionTrigger>
                <AccordionContent>{t("antiScam.faq1A")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq2" className="card-premium px-4">
                <AccordionTrigger>{t("antiScam.faq2Q")}</AccordionTrigger>
                <AccordionContent>{t("antiScam.faq2A")}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq3" className="card-premium px-4">
                <AccordionTrigger>{t("antiScam.faq3Q")}</AccordionTrigger>
                <AccordionContent>{t("antiScam.faq3A")}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <OfficialWalletsCard />
        </div>
      </div>
    </PremiumShell>
  );
};

export default VerifiedPage;
