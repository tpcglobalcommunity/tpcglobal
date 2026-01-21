import { type Language, useI18n, getLangPath } from "../../i18n";
import MemberLayout from "./MemberLayout";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Clock, ExternalLink, BookOpen } from "lucide-react";

export default function MemberPendingPage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const docsPath = `${getLangPath(lang, "")}/docs`;

  return (
    <MemberLayout lang={lang}>
      <NoticeBox variant="warning">
        <div className="text-sm text-white/85 inline-flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F0B90B]" />
          {t("member.gate.pendingNotice") || "Your account is pending verification."}
        </div>
      </NoticeBox>

      <div className="mt-4 grid gap-4">
        <PremiumCard className="p-5">
          <div className="text-white font-semibold">
            {t("member.gate.pendingTitle") || "Limited Access"}
          </div>
          <div className="text-white/60 text-sm mt-2">
            {t("member.gate.pendingDesc") ||
              "You can access basic information, but some features are locked until verification is complete."}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <PremiumButton variant="secondary" href={docsPath} className="inline-flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {t("member.gate.readDocs") || "Read Docs"}
            </PremiumButton>

            <PremiumButton 
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t("member.gate.joinTelegram") || "Join Telegram"}
            </PremiumButton>
          </div>
        </PremiumCard>
      </div>
    </MemberLayout>
  );
}
