import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Settings, Save, RefreshCcw, ShieldAlert } from "lucide-react";
import { getAppSettings, type AppSettings } from "../../lib/settings";
import { upsertSetting } from "../../lib/adminRpc";
import { useMyRole, canManageSettings } from "../../hooks/useMyRole";
import NotAuthorized from "../../components/NotAuthorized";

export default function AdminSettingsPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const { role, loading: roleLoading } = useMyRole();

  // Check if user has super admin access
  if (!roleLoading && !canManageSettings(role)) {
    return <NotAuthorized lang={lang} message="Only super administrators can access system settings." />;
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Form state
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [globalBannerEnabled, setGlobalBannerEnabled] = useState(false);
  const [globalBannerText, setGlobalBannerText] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    setSaved(false);

    try {
      const data = await getAppSettings(supabase);
      if (!data) throw new Error("Failed to load settings");

      setSettings(data);
      setMaintenance(data.maintenance_mode || false);
      setMaintenanceMessage(data.maintenance_message || "");
      setRegistrationOpen(data.registration_enabled || false);
      setGlobalBannerEnabled(data.global_banner_enabled || false);
      setGlobalBannerText(data.global_banner_text || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setSaved(false);

    try {
      const updates = [
        { key: "maintenance_mode", value: maintenance },
        { key: "maintenance_message", value: maintenanceMessage },
        { key: "registration_enabled", value: registrationOpen },
        { key: "global_banner_enabled", value: globalBannerEnabled },
        { key: "global_banner_text", value: globalBannerText },
      ];

      for (const update of updates) {
        await upsertSetting(update.key, update.value);
      }

      setSaved(true);
      // Refresh cache
      await getAppSettings(supabase);
    } catch (e: any) {
      setErr(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.settings.title") || "System Settings"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.settings.subtitle") || "Configure maintenance mode, registration, and global banner."}
          </p>
        </div>

        <PremiumButton onClick={load} disabled={loading || saving} variant="secondary">
          <span className="inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("admin.settings.refresh") || "Refresh"}
          </span>
        </PremiumButton>
      </div>

      {err ? (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{err}</div>
        </NoticeBox>
      ) : null}

      {saved ? (
        <NoticeBox variant="success">
          <div className="text-sm text-white/85">
            {t("admin.settings.saved") || "Settings saved successfully!"}
          </div>
        </NoticeBox>
      ) : null}

      <div className="grid gap-5">
        {/* Maintenance Mode */}
        <PremiumCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-[#F0B90B]" />
            <div className="text-white font-semibold">
              {t("admin.settings.maintenance.title") || "Maintenance Mode"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">
                  {t("admin.settings.maintenance.enabled") || "Enable Maintenance Mode"}
                </div>
                <div className="text-white/55 text-xs">
                  {t("admin.settings.maintenance.enabledHint") || "When enabled, all non-admin routes will show maintenance page."}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenance(!maintenance)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  maintenance ? "bg-[#F0B90B]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenance ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">
                {t("admin.settings.maintenance.message") || "Maintenance Message"}
              </label>
              <textarea
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/15"
                placeholder={t("admin.settings.maintenance.messagePlaceholder") || "Enter custom maintenance message..."}
              />
            </div>
          </div>
        </PremiumCard>

        {/* Registration */}
        <PremiumCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-[#F0B90B]" />
            <div className="text-white font-semibold">
              {t("admin.settings.registration.title") || "Registration"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-sm">
                {t("admin.settings.registration.enabled") || "Allow New Registrations"}
              </div>
              <div className="text-white/55 text-xs">
                {t("admin.settings.registration.enabledHint") || "When disabled, new users cannot sign up."}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRegistrationOpen(!registrationOpen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                registrationOpen ? "bg-[#F0B90B]" : "bg-white/20"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  registrationOpen ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </PremiumCard>

        {/* Global Banner */}
        <PremiumCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-[#F0B90B]" />
            <div className="text-white font-semibold">
              {t("admin.settings.banner.title") || "Global Banner"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm">
                  {t("admin.settings.banner.enabled") || "Show Global Banner"}
                </div>
                <div className="text-white/55 text-xs">
                  {t("admin.settings.banner.enabledHint") || "Display a banner at the top of all pages."}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGlobalBannerEnabled(!globalBannerEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  globalBannerEnabled ? "bg-[#F0B90B]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    globalBannerEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">
                {t("admin.settings.banner.text") || "Banner Text"}
              </label>
              <input
                type="text"
                value={globalBannerText}
                onChange={(e) => setGlobalBannerText(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/15"
                placeholder={t("admin.settings.banner.textPlaceholder") || "Enter banner message..."}
              />
            </div>
          </div>
        </PremiumCard>

        {/* Save Button */}
        <div className="flex justify-end">
          <PremiumButton onClick={save} disabled={saving || loading}>
            <span className="inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? t("admin.settings.saving") || "Saving..." : t("admin.settings.save") || "Save Settings"}
            </span>
          </PremiumButton>
        </div>
      </div>
    </div>
  );
}
