import { type Language, useI18n, getLangPath } from "@/i18n";
import MemberLayout from "./MemberLayout";
import { PremiumCard, PremiumButton } from "@/components/ui";
import { Layers, ExternalLink, BookOpen } from "lucide-react";

export default function ProgramsPage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const docsPath = `${getLangPath(lang, "")}/docs`;
  const telegramUrl = "https://t.me/tpcglobalcommunity";
  
  return (
    <MemberLayout lang={lang}>
      <PremiumCard className="p-5">
        <div className="text-white font-semibold inline-flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#F0B90B]" />
          {t("member.programs.title") || "Programs"}
        </div>
        <div className="text-white/60 text-sm mt-2">
          {t("member.programs.desc") || "Coming soon. We are preparing verified, risk-aware programs."}
        </div>
        <div className="mt-4 flex gap-2 flex-col sm:flex-row">
          <PremiumButton variant="secondary" href={docsPath} className="inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {t("member.common.docs") || "Read Docs"}
          </PremiumButton>
          <PremiumButton 
            href={telegramUrl}
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t("member.common.telegram") || "Join Telegram"}
          </PremiumButton>
        </div>
      </PremiumCard>
    </MemberLayout>
  );
}
