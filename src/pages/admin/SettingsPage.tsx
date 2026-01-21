import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Settings, Save, RefreshCcw, ShieldAlert } from "lucide-react";
import { fetchAppSettings, type AppSettings } from "../../lib/settings";

export default function SettingsPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [initial, setInitial] = useState<AppSettings | null>(null);
  const [form, setForm] = useState<AppSettings | null>(null);

  const dirty = useMemo(() => {
    if (!initial || !form) return false;
    return JSON.stringify(initial) !== JSON.stringify(form);
  }, [initial, form]);

  async function load() {
    setLoading(true);
    setErr(null);
    setSaved(null);
    try {
      const data = await fetchAppSettings();
      if (!data) throw new Error("Failed to load settings");

      setInitial(data);
      setForm(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!form) return;
    try {
      setErr(null);
      setSaved(null);

      const updates: any = {
        maintenance_mode: form.maintenance_mode,
        registrations_open: form.registration_enabled, // Map registration_enabled -> registrations_open
        referral_enabled: form.referral_enabled,
        referral_invite_limit: form.referral_invite_limit,
        default_member_status: form.default_member_status,
      };

      const { error } = await supabase.rpc("admin_update_app_settings", {
        p_updates: updates,
        p_action: "UPDATE_APP_SETTINGS",
      });
      if (error) throw error;

      setSaved(t("admin.settings.saved") || "Saved successfully.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to save settings");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="h-10 w-64 rounded bg-white/10 animate-pulse" />
        <div className="h-40 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
        <div className="h-40 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.settings.title") || "Settings"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.settings.subtitle") || "Global configuration for security, referrals, and registration."}
          </p>
        </div>

        <div className="flex gap-2">
          <PremiumButton variant="secondary" onClick={load}>
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              {t("admin.common.refresh") || "Refresh"}
            </span>
          </PremiumButton>

          <PremiumButton onClick={save} disabled={!dirty}>
            <span className="inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              {dirty ? t("admin.settings.save") || "Save changes" : t("admin.settings.savedBtn") || "Saved"}
            </span>
          </PremiumButton>
        </div>
      </div>

      {dirty ? (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85 inline-flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#F0B90B]" />
            {t("admin.settings.unsaved") || "You have unsaved changes."}
          </div>
        </NoticeBox>
      ) : null}

      {saved ? (
        <NoticeBox variant="success">
          <div className="text-sm text-white/85">{saved}</div>
        </NoticeBox>
      ) : null}

      {err ? (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{err}</div>
        </NoticeBox>
      ) : null}

      {!form ? (
        <PremiumCard className="p-5">
          <div className="text-white/70">{t("admin.settings.empty") || "Settings not available."}</div>
        </PremiumCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* SECURITY / OPERATIONS */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("admin.settings.opsTitle") || "Operations"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("admin.settings.opsDesc") || "Control maintenance mode and registrations."}
            </div>

            <div className="mt-4 grid gap-4">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-white/80 text-sm">
                    {t("admin.settings.maintenance") || "Maintenance mode"}
                  </div>
                  <div className="text-white/50 text-xs">
                    {t("admin.settings.maintenanceDesc") || "Temporarily disable most features for updates."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.maintenance_mode}
                  onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })}
                  className="h-5 w-5 accent-[#F0B90B]"
                />
              </label>

              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-white/80 text-sm">
                    {t("admin.settings.regOpen") || "Registrations open"}
                  </div>
                  <div className="text-white/50 text-xs">
                    {t("admin.settings.regOpenDesc") || "Allow new signups (can still require referral)."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.registration_enabled}
                  onChange={(e) => setForm({ ...form, registration_enabled: e.target.checked })}
                  className="h-5 w-5 accent-[#F0B90B]"
                />
              </label>

              <label className="grid gap-2">
                <div className="text-white/80 text-sm">
                  {t("admin.settings.defaultStatus") || "Default member status"}
                </div>
                <select
                  value={form.default_member_status}
                  onChange={(e) => setForm({ ...form, default_member_status: e.target.value })}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                </select>
                <div className="text-white/50 text-xs">
                  {t("admin.settings.defaultStatusDesc") || "How new members are marked after signup."}
                </div>
              </label>
            </div>
          </PremiumCard>

          {/* REFERRALS */}
          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("admin.settings.refTitle") || "Referrals"}
            </div>
            <div className="text-white/55 text-sm mt-1">
              {t("admin.settings.refDesc") || "Control referral system rules and limits."}
            </div>

            <div className="mt-4 grid gap-4">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-white/80 text-sm">
                    {t("admin.settings.refEnabled") || "Referral system enabled"}
                  </div>
                  <div className="text-white/50 text-xs">
                    {t("admin.settings.refEnabledDesc") || "Turn off referrals during maintenance or migration."}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!form.referral_enabled}
                  onChange={(e) => setForm({ ...form, referral_enabled: e.target.checked })}
                  className="h-5 w-5 accent-[#F0B90B]"
                />
              </label>

              <label className="grid gap-2">
                <div className="text-white/80 text-sm">
                  {t("admin.settings.inviteLimit") || "Invite limit per code"}
                </div>
                <input
                  type="number"
                  min={0}
                  value={form.referral_invite_limit ?? 0}
                  onChange={(e) => setForm({ ...form, referral_invite_limit: Number(e.target.value) })}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                />
                <div className="text-white/50 text-xs">
                  {t("admin.settings.inviteLimitDesc") || "0 = unlimited. Use this to prevent abuse."}
                </div>
              </label>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-white/70 text-sm">
                  {t("admin.settings.auditNote") || "Audited changes"}
                </div>
                <div className="text-white/50 text-xs mt-1">
                  {t("admin.settings.auditNoteDesc") || "All updates will appear in Audit Log with full payload."}
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}
    </div>
  );
}
