import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { Search, RefreshCcw, ToggleLeft, ToggleRight, Filter, Link2, ChevronLeft, ChevronRight } from "lucide-react";

type CodeRow = {
  code: string;
  owner_id: string | null;
  is_active: boolean | null;
  used_count: number | null;
  created_at: string | null;
};

type UseRow = {
  id?: any;
  code?: string | null;
  invited_by?: string | null;
  used_by?: string | null;
  created_at?: string | null;
};

const PAGE_SIZE = 14;

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function activeChip(active?: boolean | null) {
  const base = "text-xs px-2 py-0.5 rounded-full border";
  if (active) return `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-200`;
  return `${base} bg-red-500/10 border-red-500/20 text-red-200`;
}

export default function ReferralsPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"ALL" | "ACTIVE" | "DISABLED">("ALL");

  const [cursor, setCursor] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);

  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [uses, setUses] = useState<UseRow[] | null>(null);

  const canNext = useMemo(() => codes.length === PAGE_SIZE, [codes.length]);
  const canPrev = useMemo(() => stack.length > 0, [stack.length]);

  async function load(reset = false) {
    setLoading(true);
    setErr(null);

    try {
      let query = supabase
        .from("referral_codes")
        .select("code, owner_id, is_active, used_count, created_at")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (only === "ACTIVE") query = query.eq("is_active", true);
      if (only === "DISABLED") query = query.eq("is_active", false);

      const term = q.trim();
      if (term) {
        const esc = term.replace(/%/g, "\\%").replace(/_/g, "\\_");
        query = query.or(`code.ilike.%${esc}%,owner_id::text.ilike.%${esc}%`);
      }

      if (!reset && cursor) query = query.lt("created_at", cursor);

      const { data, error } = await query;
      if (error) throw error;

      setCodes((data || []) as CodeRow[]);
      if (reset) {
        setCursor(null);
        setStack([]);
      }

      // recent uses (optional)
      try {
        const { data: u, error: ue } = await supabase
          .from("referral_uses")
          .select("id, code, invited_by, used_by, created_at")
          .order("created_at", { ascending: false })
          .limit(20);
        if (ue) throw ue;
        setUses((u || []) as UseRow[]);
      } catch {
        setUses(null);
      }
    } catch (e: any) {
      setErr(e?.message || "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(true); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    const tmr = setTimeout(() => load(true), 350);
    return () => clearTimeout(tmr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, only]);

  useEffect(() => { load(false); /* eslint-disable-next-line */ }, [cursor]);

  async function nextPage() {
    if (!codes.length) return;
    const last = codes[codes.length - 1]?.created_at;
    if (!last) return;
    setStack((s) => [...s, cursor || "__FIRST__"]);
    setCursor(last);
  }

  async function prevPage() {
    if (!canPrev) return;
    const prev = stack[stack.length - 1];
    setStack((s) => s.slice(0, -1));
    setCursor(prev === "__FIRST__" ? null : prev);
  }

  async function toggle(code: string, nextActive: boolean) {
    if (!confirm(`Set ${code} to ${nextActive ? "ACTIVE" : "DISABLED"}?`)) return;
    try {
      setErr(null);
      const { error } = await supabase.rpc("admin_toggle_referral_code", {
        p_code: code,
        p_is_active: nextActive,
        p_action: nextActive ? "REFERRAL_ENABLE" : "REFERRAL_DISABLE",
      });
      if (error) throw error;
      await load(true);
    } catch (e: any) {
      setErr(e?.message || "Failed to toggle referral code");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            {t("admin.referrals.title") || "Referrals"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.referrals.subtitle") || "Manage referral codes and monitor invitation activity."}
          </p>
        </div>

        <PremiumButton onClick={() => load(true)} className="shrink-0">
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

      {/* Controls */}
      <PremiumCard className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("admin.referrals.search") || "Search code / owner..."}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/35 outline-none focus:border-[#F0B90B]/40"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={only}
              onChange={(e) => setOnly(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
            >
              <option value="ALL">Status: ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="text-white/70 text-sm">{t("admin.referrals.note") || "Actions are audited"}</div>
            <div className="text-white/50 text-xs mt-1">
              {t("admin.referrals.noteDesc") || "Enable/Disable will be recorded in Audit Log automatically."}
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Codes */}
      <PremiumCard className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="text-white/80 text-sm">{t("admin.referrals.codes") || "Referral Codes"}</div>
          <div className="text-white/50 text-xs">{t("admin.referrals.pageSize") || "Page size"}: {PAGE_SIZE}</div>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-4">
                <div className="h-4 w-72 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
              </div>
            ))
          ) : codes.length ? (
            codes.map((c) => (
              <div key={c.code} className="px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">
                    <span className="text-[#F0B90B]">{c.code}</span>
                    <span className="text-white/55"> • {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</span>
                  </div>
                  <div className="text-xs text-white/55 mt-1">
                    owner: {shortId(c.owner_id)} • used_count: {c.used_count ?? 0}
                  </div>
                  <div className="mt-2">
                    <span className={activeChip(!!c.is_active)}>
                      {c.is_active ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <PremiumButton
                    variant="secondary"
                    onClick={() => toggle(c.code, !c.is_active)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {c.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                      {c.is_active
                        ? t("admin.referrals.disable") || "Disable"
                        : t("admin.referrals.enable") || "Enable"}
                    </span>
                  </PremiumButton>

                  <PremiumButton variant="secondary" onClick={() => navigator.clipboard.writeText(c.code)}>
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      {t("admin.referrals.copy") || "Copy code"}
                    </span>
                  </PremiumButton>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-white/60 text-sm">
              {t("admin.referrals.empty") || "No referral codes found."}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
          <PremiumButton variant="secondary" onClick={prevPage} disabled={!canPrev}>
            <span className="inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> {t("admin.common.prev") || "Prev"}
            </span>
          </PremiumButton>

          <div className="text-xs text-white/55">
            {t("admin.referrals.paginationHint") || "Use Prev/Next to navigate pages."}
          </div>

          <PremiumButton variant="secondary" onClick={nextPage} disabled={!canNext}>
            <span className="inline-flex items-center gap-2">
              {t("admin.common.next") || "Next"} <ChevronRight className="w-4 h-4" />
            </span>
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* Usage */}
      <PremiumCard className="p-4">
        <div className="text-white font-semibold">
          {t("admin.referrals.usageTitle") || "Recent Referral Usage"}
        </div>
        <div className="text-white/55 text-sm mt-1">
          {t("admin.referrals.usageDesc") || "Latest invite events (if enabled)."}
        </div>

        <div className="mt-4 divide-y divide-white/10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-3">
                <div className="h-4 w-64 rounded bg-white/10 animate-pulse mb-2" />
                <div className="h-3 w-40 rounded bg-white/10 animate-pulse" />
              </div>
            ))
          ) : uses === null ? (
            <div className="py-4 text-white/60 text-sm">
              {t("admin.referrals.usageNotConfigured") || "referral_uses table not configured yet."}
            </div>
          ) : uses.length ? (
            uses.map((u) => (
              <div key={String(u.id ?? `${u.code}-${u.created_at}`)} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white truncate">
                    code: <span className="text-[#F0B90B]">{u.code || "—"}</span>
                  </div>
                  <div className="text-xs text-white/55 truncate">
                    invited_by: {shortId(u.invited_by)} • used_by: {shortId(u.used_by)}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                  {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                </span>
              </div>
            ))
          ) : (
            <div className="py-4 text-white/60 text-sm">
              {t("admin.referrals.usageEmpty") || "No referral usage events yet."}
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
