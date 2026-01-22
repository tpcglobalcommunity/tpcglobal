import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { User, Wallet, BadgeCheck, ArrowLeft, RefreshCcw, Copy } from "lucide-react";
import { updateMember } from "../../lib/adminRpc";

function qs(name: string) {
  if (typeof window === "undefined") return null;
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function chipClass(v?: string | null, kind?: "status" | "verify") {
  const s = (v || "").toUpperCase();
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (kind === "status") {
    if (s === "ACTIVE") return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
    if (s === "PENDING") return `${base} bg-amber-500/10 border-amber-500/20 text-amber-200`;
    if (s === "BANNED") return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
  }
  if (kind === "verify") {
    if (s === "VERIFIED") return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
    if (s === "REQUESTED") return `${base} bg-amber-500/10 border-amber-500/20 text-amber-200`;
    if (s === "REJECTED") return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
  }
  return `${base} bg-white/5 border-white/10 text-white/70`;
}

async function copyText(txt: string) {
  try { await navigator.clipboard.writeText(txt); } catch {}
}

type Profile = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
  verified?: boolean | null;
  wallet_address?: string | null;
  verification_status?: string | null;
  created_at?: string | null;
};

type ReferralUse = {
  id?: number;
  code: string;
  invited_by: string | null;
  used_by: string;
  created_at: string;
};

type VReq = {
  id: number;
  created_at: string;
  status: string;
  wallet_address: string;
  notes?: string | null;
};

export default function MemberDetailPage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const baseAdmin = `${getLangPath(lang, "")}/admin`;
  const memberId = useMemo(() => qs("id"), []);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [ref, setRef] = useState<ReferralUse | null>(null);
  const [vreqs, setVreqs] = useState<VReq[]>([]);

  // Admin actions state
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [newVerified, setNewVerified] = useState<string>("");
  const [newVStatus, setNewVStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      if (!memberId) {
        setErr("Missing member id.");
        return;
      }

      // Profile
      const { data: p, error: pe } = await supabase
        .from("profiles")
        .select("id, email, username, full_name, role, verified, wallet_address, verification_status, created_at")
        .eq("id", memberId)
        .single();
      if (pe) throw pe;

      // Referral usage (if any)
      const { data: r, error: re } = await supabase
        .from("referral_uses")
        .select("id, code, invited_by, used_by, created_at")
        .eq("used_by", memberId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (re) throw re;

      // Verification history
      const { data: v, error: ve } = await supabase
        .from("verification_requests")
        .select("id, created_at, status, wallet_address, notes")
        .eq("user_id", memberId)
        .order("created_at", { ascending: false })
        .limit(25);
      if (ve) throw ve;

      setProfile(p as Profile);
      setRef(r && r[0] ? (r[0] as ReferralUse) : null);
      setVreqs((v || []) as VReq[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load member detail");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function apply() {
    if (!memberId) return;
    setSaving(true);
    setActionErr(null);
    setActionOk(null);
    try {
      await updateMember({
        userId: memberId,
        status: newStatus || undefined,
        role: newRole || undefined,
        verified: newVerified === "" ? undefined : (newVerified === "true"),
      });
      
      setActionOk("Updated successfully.");
      setNewStatus("");
      setNewRole("");
      setNewVerified("");
      setNewVStatus("");
      setNotes("");
      await load();
    } catch (e: any) {
      setActionErr(e?.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <a
              href={`${baseAdmin}/members`}
              className="text-white/60 hover:text-white inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.memberDetail.back") || "Back to Members"}
            </a>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-white mt-2">
            {t("admin.memberDetail.title") || "Member Detail"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.memberDetail.subtitle") || "Full profile, referral, and verification history."}
          </p>
        </div>

        <PremiumButton variant="secondary" onClick={load} disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("admin.common.refresh") || "Refresh"}
          </span>
        </PremiumButton>
      </div>

      {err ? (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{err}</div>
        </NoticeBox>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Profile */}
        <PremiumCard className="p-5 lg:col-span-2">
          <div className="text-white font-semibold inline-flex items-center gap-2">
            <User className="w-4 h-4 text-[#F0B90B]" />
            {t("admin.memberDetail.profile") || "Profile"}
          </div>

          {loading ? (
            <div className="mt-4 space-y-2">
              <div className="h-4 w-64 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-80 rounded bg-white/10 animate-pulse" />
            </div>
          ) : profile ? (
            <div className="mt-4 grid gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={chipClass(profile.verified ? "ACTIVE" : "INACTIVE", "status")}>{(profile.verified ? "ACTIVE" : "INACTIVE").toUpperCase()}</span>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                  verified: {profile.verified ? "true" : "false"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                  role: {profile.role || "member"}
                </span>
                <span className={chipClass(profile.verification_status, "verify")}>
                  v: {(profile.verification_status || "NONE").toUpperCase()}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="text-xs text-white/55">id</div>
                  <div className="mt-1 text-white/85 break-all inline-flex items-center gap-2">
                    {profile.id}
                    <button onClick={() => copyText(profile.id)} className="text-white/50 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="text-xs text-white/55">email</div>
                  <div className="mt-1 text-white/85 break-all">{profile.email || "—"}</div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="text-xs text-white/55">username</div>
                  <div className="mt-1 text-white/85">{profile.username || "—"}</div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="text-xs text-white/55">full_name</div>
                  <div className="mt-1 text-white/85">{profile.full_name || "—"}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs text-white/55">created_at</div>
                <div className="mt-1 text-white/85">
                  {profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/60">No profile.</div>
          )}
        </PremiumCard>

        {/* Wallet / Referral */}
        <div className="grid gap-4">
          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#F0B90B]" />
              {t("admin.memberDetail.wallet") || "Wallet"}
            </div>
            <div className="mt-3 text-sm text-white/80 break-all">
              {profile?.wallet_address || "—"}
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold inline-flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[#F0B90B]" />
              {t("admin.memberDetail.referral") || "Referral"}
            </div>
            <div className="mt-3 text-sm text-white/80">
              {ref ? (
                <div className="space-y-1">
                  <div>code: <span className="text-[#F0B90B]">{ref.code}</span></div>
                  <div className="text-xs text-white/55">invited_by: {shortId(ref.invited_by)}</div>
                  <div className="text-xs text-white/45">{new Date(ref.created_at).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-white/60">No referral usage.</div>
              )}
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <div className="text-white font-semibold">
              {t("admin.memberDetail.adminActions") || "Admin Actions"}
            </div>

            {actionErr ? (
              <NoticeBox variant="warning" className="mt-3">
                <div className="text-sm text-white/85">{actionErr}</div>
              </NoticeBox>
            ) : null}

            {actionOk ? (
              <NoticeBox variant="success" className="mt-3">
                <div className="text-sm text-white/85">{actionOk}</div>
              </NoticeBox>
            ) : null}

            <div className="mt-4 grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-white/55">
                  {t("admin.memberDetail.status") || "Status"}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                >
                  <option value="">{t("admin.memberDetail.noChange") || "No change"}</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="BANNED">BANNED</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-white/55">
                  {t("admin.memberDetail.role") || "Role"}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                >
                  <option value="">{t("admin.memberDetail.noChange") || "No change"}</option>
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-white/55">
                  {t("admin.memberDetail.verified") || "Verified"}
                </label>
                <select
                  value={newVerified}
                  onChange={(e) => setNewVerified(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                >
                  <option value="">{t("admin.memberDetail.noChange") || "No change"}</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-white/55">
                  {t("admin.memberDetail.verificationStatus") || "Verification Status"}
                </label>
                <select
                  value={newVStatus}
                  onChange={(e) => setNewVStatus(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                >
                  <option value="">{t("admin.memberDetail.noChange") || "No change"}</option>
                  <option value="NONE">NONE</option>
                  <option value="REQUESTED">REQUESTED</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs text-white/55">
                  {t("admin.memberDetail.notes") || "Notes"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("admin.memberDetail.notesPlaceholder") || "Admin notes..."}
                  className="min-h-[80px] px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                />
              </div>

              <div className="flex gap-2">
                <PremiumButton
                  onClick={() => setNewStatus("BANNED")}
                  variant="secondary"
                  className="flex-1"
                >
                  {t("admin.memberDetail.ban") || "Ban"}
                </PremiumButton>
                <PremiumButton
                  onClick={() => setNewStatus("ACTIVE")}
                  variant="secondary"
                  className="flex-1"
                >
                  {t("admin.memberDetail.activate") || "Activate"}
                </PremiumButton>
              </div>

              <PremiumButton
                onClick={apply}
                disabled={saving || (!newStatus && !newRole && !newVerified && !newVStatus && !notes)}
                className="w-full"
              >
                {saving ? (
                  t("admin.memberDetail.saving") || "Saving..."
                ) : (
                  t("admin.memberDetail.applyChanges") || "Apply Changes"
                )}
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Verification history */}
      <PremiumCard className="p-5">
        <div className="text-white font-semibold">
          {t("admin.memberDetail.verHistory") || "Verification History"}
        </div>

        {vreqs.length === 0 ? (
          <div className="mt-3 text-sm text-white/60">No verification requests.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {vreqs.map((v) => (
              <div key={v.id} className="rounded-2xl bg-white/5 border border-white/10 p-3">
                <div className="text-white/85">
                  #{v.id} • {v.status} • {new Date(v.created_at).toLocaleString()}
                </div>
                <div className="text-xs text-white/55 mt-1 break-all">
                  wallet: {v.wallet_address}
                </div>
                {v.notes ? <div className="text-xs text-white/55 mt-2">notes: {v.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </div>
  );
}
