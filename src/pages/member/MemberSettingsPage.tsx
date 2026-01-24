import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Language, useI18n, getLangPath } from "@/i18n";
import MemberLayout from "./MemberLayout";
import { PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { Save, LogOut, User, Mail, MapPin } from "lucide-react";

type ProfileRow = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  city?: string | null;
  status?: string | null;
  verified?: boolean | null;
};

function mapErr(code: string) {
  switch (code) {
    case "USERNAME_TAKEN": return "Username already taken.";
    case "USERNAME_LENGTH": return "Username must be 3-20 characters.";
    case "USERNAME_FORMAT": return "Username can only contain letters, numbers, and underscore.";
    default: return "Failed to save.";
  }
}

export default function MemberSettingsPage({ lang }: { lang: Language }) {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");

  const dirty = useMemo(() => {
    if (!profile) return false;
    return (
      (username || "") !== (profile.username || "") ||
      (fullName || "") !== (profile.full_name || "") ||
      (city || "") !== (profile.city || "")
    );
  }, [profile, username, fullName, city]);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const { data: ses } = await supabase.auth.getSession();
      const uid = ses.session?.user?.id;
      const email = ses.session?.user?.email;
      if (!uid) {
        window.location.href = `${getLangPath(lang, "")}/signin`;
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, city, verified")
        .eq("id", uid)
        .maybeSingle(); // Use maybeSingle to prevent errors
      if (error) {
        console.warn('Profile fetch error:', error);
        setErr("Failed to load profile");
        return;
      }
      if (!data) {
        console.warn('No profile found for user:', uid);
        setErr("Profile not found");
        return;
      }

      const p = { ...(data as any), email } as ProfileRow;
      setProfile(p);
      setUsername(p.username || "");
      setFullName(p.full_name || "");
      setCity(p.city || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setErr(null);
    setOk(null);

    try {
      const { data, error } = await supabase.rpc("member_update_profile_self", {
        p_username: username,
        p_full_name: fullName,
        p_city: city,
      });

      if (error) throw error;

      const okFlag = !!data?.ok;
      if (!okFlag) {
        const code = data?.error || "UNKNOWN";
        setErr(mapErr(code));
        return;
      }

      setOk(t("member.settings.saved") || "Saved successfully.");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = `${getLangPath(lang, "")}/`;
  }

  return (
    <MemberLayout lang={lang}>
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {t("member.settings.title") || "Settings"}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {t("member.settings.subtitle") || "Update your profile safely and manage your session."}
            </p>
          </div>

          <div className="flex gap-2">
            <PremiumButton onClick={save} disabled={!dirty || loading}>
              <span className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                {t("member.settings.save") || "Save"}
              </span>
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={signOut}>
              <span className="inline-flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {t("member.settings.logout") || "Sign out"}
              </span>
            </PremiumButton>
          </div>
        </div>

        {err ? (
          <NoticeBox variant="warning">
            <div className="text-sm text-white/85">{err}</div>
          </NoticeBox>
        ) : null}

        {ok ? (
          <NoticeBox variant="success">
            <div className="text-sm text-white/85">{ok}</div>
          </NoticeBox>
        ) : null}

        <div className="grid md:grid-cols-2 gap-4">
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <User className="w-4 h-4 text-[#F0B90B]" />
              {t("member.settings.profileTitle") || "Profile"}
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="text-xs text-white/55">
                  {t("member.settings.username") || "Username"}
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  placeholder="tpc_member"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-white/55">
                  {t("member.settings.fullName") || "Full name"}
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  placeholder="Bang Eko"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-xs text-white/55 inline-flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-white/45" />
                  {t("member.settings.city") || "City"}
                </span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  placeholder="Purbalingga"
                />
              </label>

              <div className="text-xs text-white/45">
                {t("member.settings.hint") || "Only safe fields can be updated. Email is managed by auth."}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F0B90B]" />
              {t("member.settings.accountTitle") || "Account"}
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs text-white/55">
                  {t("member.settings.email") || "Email"}
                </div>
                <div className="text-white/85 mt-1 truncate">{profile?.email || "—"}</div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs text-white/55">
                  {t("member.settings.status") || "Status"}
                </div>
                <div className="text-white/85 mt-1">
                  {(profile?.status || "—").toUpperCase()} • verified: {profile?.verified ? "true" : "false"}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs text-white/55">
                  {t("member.settings.security") || "Security"}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  {t("member.settings.securityDesc") || "Never share your password. Enable email verification."}
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </MemberLayout>
  );
}
