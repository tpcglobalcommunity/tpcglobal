import { useEffect, useState } from "react";
import { type Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { Wrench, Shield, ArrowLeft, ExternalLink } from "lucide-react";
import { getAppSettings, type AppSettings } from "@/lib/settings";
import { supabase } from "@/lib/supabase";

export default function MaintenancePage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const homePath = getLangPath(lang, "/home");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getAppSettings(supabase);
        if (!alive) return;
        setSettings(s);
        
        // Redirect to home jika maintenance=false
        if (s?.maintenance_mode === false) {
          window.location.href = homePath;
          return;
        }
      } catch {
        // Silently fail - redirect ke home untuk safety
        window.location.href = homePath;
      }
    })();
    return () => { alive = false; };
  }, []);

  // Jika settings belum ada atau maintenance=false, tampilkan loading atau redirect
  if (!settings || settings?.maintenance_mode === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/70">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const maintenanceMessage = settings?.maintenance_message || t("maintenance.subtitle");

  return (
    <PremiumShell>
      <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-28">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/25 mb-4">
          <Shield className="w-4 h-4 text-[#F0B90B]" />
          <span className="text-sm font-semibold text-white/90">
            {t("maintenance.badge")}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {t("maintenance.title")}
        </h1>
        <p className="text-white/65 mt-3 text-sm md:text-lg max-w-[60ch]">
          {maintenanceMessage}
        </p>

        <div className="mt-6 grid gap-4">
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85 inline-flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#F0B90B]" />
              {t("maintenance.notice")}
            </div>
          </NoticeBox>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("maintenance.ctaTitle")}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {t("maintenance.ctaDesc")}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="https://t.me/tpcglobalcommunity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <PremiumButton>
                  {t("maintenance.joinTelegram")}
                  <ExternalLink className="w-4 h-4" />
                </PremiumButton>
              </a>

              <a href={homePath} className="inline-flex items-center gap-2">
                <PremiumButton variant="secondary">
                  <ArrowLeft className="w-4 h-4" />
                  {t("maintenance.backHome")}
                </PremiumButton>
              </a>
            </div>

            <div className="mt-4 text-xs text-white/45">
              {t("maintenance.footnote")}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
