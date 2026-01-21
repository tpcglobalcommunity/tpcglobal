import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Ban, LogOut, ExternalLink, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MemberBannedPage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const homePath = `${getLangPath(lang, "")}/`;

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = homePath;
  }

  return (
    <PremiumShell>
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-28">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-4">
          <Shield className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-sm font-semibold text-white/90">
            {t("member.gate.badge") || "Member Access"}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {t("member.gate.bannedTitle") || "Access Revoked"}
        </h1>
        <p className="text-white/65 mt-3 text-sm md:text-lg max-w-[60ch]">
          {t("member.gate.bannedSubtitle") ||
            "This account has been restricted. If you believe this is a mistake, contact support."}
        </p>

        <div className="mt-6 grid gap-4">
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85 inline-flex items-center gap-2">
              <Ban className="w-4 h-4 text-[#F0B90B]" />
              {t("member.gate.bannedNotice") || "Your status is BANNED."}
            </div>
          </NoticeBox>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("member.gate.nextTitle") || "Next steps"}
            </div>
            <div className="text-white/60 text-sm mt-2">
              {t("member.gate.nextDesc") || "You can sign out or reach the official channel."}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <PremiumButton variant="secondary" onClick={signOut}>
                <span className="inline-flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  {t("member.gate.signOut") || "Sign out"}
                </span>
              </PremiumButton>

              <PremiumButton 
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t("member.gate.contact") || "Contact via Telegram"}
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
