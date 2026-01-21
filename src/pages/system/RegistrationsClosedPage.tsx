import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Lock, ExternalLink, LogIn, Shield } from "lucide-react";

export default function RegistrationsClosedPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const signinPath = `${getLangPath(lang)}/signin`;

  return (
    <PremiumShell>
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-28">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-4">
          <Shield className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-sm font-semibold text-white/90">
            {t("signupGate.badge") || "Registration Gate"}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {t("signupGate.title") || "Registrations are temporarily closed"}
        </h1>
        <p className="text-white/65 mt-3 text-sm md:text-lg max-w-[60ch]">
          {t("signupGate.subtitle") ||
            "We're controlling access for security and capacity. Please follow updates on the official channel."}
        </p>

        <div className="mt-6 grid gap-4">
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85 inline-flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F0B90B]" />
              {t("signupGate.notice") || "New signups are disabled by admin settings."}
            </div>
          </NoticeBox>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("signupGate.ctaTitle") || "Already have an account?"}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {t("signupGate.ctaDesc") || "You can still sign in during this period."}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a href={signinPath} className="inline-flex items-center gap-2">
                <PremiumButton>
                  <LogIn className="w-4 h-4" />
                  {t("signupGate.signin") || "Go to Sign In"}
                </PremiumButton>
              </a>

              <a
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <PremiumButton variant="secondary">
                  {t("signupGate.telegram") || "Open Telegram Channel"}
                  <ExternalLink className="w-4 h-4" />
                </PremiumButton>
              </a>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
