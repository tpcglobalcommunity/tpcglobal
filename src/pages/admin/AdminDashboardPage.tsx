import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useTranslations } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Users, ShieldCheck, Clock, Ban, RefreshCcw, Link2, Search } from "lucide-react";

type Stat = { label: string; value: string; icon: any };
type MemberRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  role?: string | null;
  status?: string | null;
  created_at?: string | null;
};
type ReferralUseRow = {
  id?: string;
  code?: string | null;
  used_by?: string | null;
  invited_by?: string | null;
  created_at?: string | null;
};

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat().format(n);
}

function badge(status?: string | null) {
  const s = (status || "").toUpperCase();
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (s === "ACTIVE") return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
  if (s === "PENDING") return `${base} bg-amber-500/10 border-amber-500/20 text-amber-200`;
  if (s === "BANNED") return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
  return `${base} bg-white/5 border-white/10 text-white/70`;
}

export default function AdminDashboardPage({ lang }: { lang: Language }) {
  const t = useTranslations(lang);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    pending: 0,
    banned: 0,
    referralCodes: null as number | null,
    referralUsed: null as number | null,
  });

  const [latestMembers, setLatestMembers] = useState<MemberRow[]>([]);
  const [latestReferralUses, setLatestReferralUses] = useState<ReferralUseRow[] | null>(null);

  const stats: Stat[] = useMemo(() => ([
    { label: t("admin.stats.totalMembers", { defaultValue: "Total Members" }), value: fmt(counts.total), icon: Users },
    { label: t("admin.stats.active", { defaultValue: "Active" }), value: fmt(counts.active), icon: ShieldCheck },
    { label: t("admin.stats.pending", { defaultValue: "Pending" }), value: fmt(counts.pending), icon: Clock },
    { label: t("admin.stats.banned", { defaultValue: "Banned" }), value: fmt(counts.banned), icon: Ban },
  ]), [counts, t]);

  async function safeCountProfiles(filter?: { col: string; eq: string }) {
    let q = supabase.from("profiles").select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.col as any, filter.eq as any);
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // Members counts
      const [total, active, pending, banned] = await Promise.all([
        safeCountProfiles(),
        safeCountProfiles({ col: "status", eq: "ACTIVE" }),
        safeCountProfiles({ col: "status", eq: "PENDING" }),
        safeCountProfiles({ col: "status", eq: "BANNED" }),
      ]);

      // Latest members
      const { data: members, error: memErr } = await supabase
        .from("profiles")
        .select("id, email, full_name, username, role, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (memErr) throw memErr;

      // Referral stats (graceful)
      let referralCodes: number | null = null;
      let referralUsed: number | null = null;

      // Try referral_codes count
      try {
        const { count: rcCount, error: rcErr } = await supabase
          .from("referral_codes")
          .select("code", { count: "exact", head: true });
        if (rcErr) throw rcErr;
        referralCodes = rcCount || 0;
      } catch {
        referralCodes = null;
      }

      // Try referral_uses count
      try {
        const { count: ruCount, error: ruErr } = await supabase
          .from("referral_uses")
          .select("id", { count: "exact", head: true });
        if (ruErr) throw ruErr;
        referralUsed = ruCount || 0;
      } catch {
        referralUsed = null;
      }

      // Try latest referral uses
      let uses: ReferralUseRow[] | null = null;
      try {
        const { data, error } = await supabase
          .from("referral_uses")
          .select("id, code, used_by, invited_by, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        uses = data || [];
      } catch {
        uses = null;
      }

      setCounts({ total, active, pending, banned, referralCodes, referralUsed });
      setLatestMembers(members || []);
      setLatestReferralUses(uses);
    } catch (e: any) {
      setErr(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t("admin.dashboard.title", { defaultValue: "Dashboard" })}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.dashboard.subtitle", { defaultValue: "Realtime overview of members and referrals." })}
          </p>
        </div>

        <PremiumButton onClick={load} className="shrink-0">
          <span className="inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("admin.dashboard.refresh", { defaultValue: "Refresh" })}
          </span>
        </PremiumButton>
      </div>

      {err ? (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{err}</div>
        </NoticeBox>
      ) : null}

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))
        ) : (
          stats.map((s) => {
            const Icon = s.icon;
            return (
              <PremiumCard key={s.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#F0B90B]" />
                  </div>
                  <div>
                    <div className="text-white/65 text-xs">{s.label}</div>
                    <div className="text-white text-xl font-bold">{s.value}</div>
                  </div>
                </div>
              </PremiumCard>
            );
          })
        )}
      </div>

      {/* REFERRAL STATS (optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-sm">
              {t("admin.stats.referralCodes", { defaultValue: "Referral Codes" })}
            </div>
            <Link2 className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-white text-2xl font-bold mt-2">
            {loading ? "…" : (counts.referralCodes === null ? "Not configured" : fmt(counts.referralCodes))}
          </div>
          <div className="text-white/55 text-xs mt-1">
            {t("admin.stats.referralCodesHint", { defaultValue: "Total codes created in system." })}
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-sm">
              {t("admin.stats.referralUsed", { defaultValue: "Referral Used" })}
            </div>
            <Link2 className="w-4 h-4 text-white/40" />
          </div>
          <div className="text-white text-2xl font-bold mt-2">
            {loading ? "…" : (counts.referralUsed === null ? "Not configured" : fmt(counts.referralUsed))}
          </div>
          <div className="text-white/55 text-xs mt-1">
            {t("admin.stats.referralUsedHint", { defaultValue: "Total successful invite usage events." })}
          </div>
        </PremiumCard>
      </div>

      {/* LATEST MEMBERS */}
      <PremiumCard className="p-4">
        <div className="text-white font-semibold">
          {t("admin.latestMembers", { defaultValue: "Latest Members" })}
        </div>
        <div className="text-white/55 text-sm mt-1">
          {t("admin.latestMembersDesc", { defaultValue: "The most recent registrations." })}
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-3">
                <div className="h-4 w-48 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
              </div>
            ))
          ) : latestMembers.length ? (
            latestMembers.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white truncate">
                    {m.username || m.full_name || m.email || m.id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-white/55 truncate">
                    {(m.email || "—")} • {(m.role || "member")}
                  </div>
                </div>
                <span className={badge(m.status)}>{(m.status || "—").toUpperCase()}</span>
              </div>
            ))
          ) : (
            <div className="py-4 text-white/60 text-sm">
              {t("admin.emptyMembers", { defaultValue: "No members yet." })}
            </div>
          )}
        </div>
      </PremiumCard>

      {/* LATEST REFERRAL USES (optional) */}
      <PremiumCard className="p-4">
        <div className="text-white font-semibold">
          {t("admin.latestReferrals", { defaultValue: "Latest Referral Usage" })}
        </div>
        <div className="text-white/55 text-sm mt-1">
          {t("admin.latestReferralsDesc", { defaultValue: "Recent referral events (if enabled)." })}
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3">
                <div className="h-4 w-56 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
              </div>
            ))
          ) : latestReferralUses === null ? (
            <div className="py-4 text-white/60 text-sm">
              {t("admin.referralsNotConfigured", { defaultValue: "Referral usage table not configured yet." })}
            </div>
          ) : latestReferralUses.length ? (
            latestReferralUses.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white truncate">
                    {t("admin.referralCode", { defaultValue: "Code" })}: <span className="text-[#F0B90B]">{r.code || "—"}</span>
                  </div>
                  <div className="text-xs text-white/55 truncate">
                    used_by: {r.used_by || "—"} • invited_by: {r.invited_by || "—"}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                </span>
              </div>
            ))
          ) : (
            <div className="py-4 text-white/60 text-sm">
              {t("admin.emptyReferrals", { defaultValue: "No referral usage events yet." })}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
