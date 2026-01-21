import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { ScrollText, Search, RefreshCcw, ArrowLeft, ArrowRight } from "lucide-react";

type Row = {
  id: number;
  created_at: string;
  actor_id: string | null;
  action: string;
  target_id: string | null;
  payload: any;
};

const PAGE_SIZE = 25;

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export default function AuditLogPage({ lang }: { lang: Language }) {
  const { t } = useI18n(lang);
  const baseAdmin = `${getLangPath(lang, "")}/admin`;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  const [qAction, setQAction] = useState("");
  const [qActor, setQActor] = useState("");
  const [qTarget, setQTarget] = useState("");

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const canPrev = page > 0;
  const canNext = from + rows.length < total;

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      let q = supabase
        .from("admin_audit_log")
        .select("id, created_at, actor_id, action, target_id, payload", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (qAction.trim()) q = q.ilike("action", `%${qAction.trim()}%`);
      if (qActor.trim()) q = q.ilike("actor_id", `%${qActor.trim()}%`);
      if (qTarget.trim()) q = q.ilike("target_id", `%${qTarget.trim()}%`);

      const { data, error, count } = await q;
      if (error) throw error;

      setRows((data || []) as Row[]);
      setTotal(count || 0);
    } catch (e: any) {
      setErr(e?.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }

  // reset page when filter changes
  useEffect(() => { setPage(0); }, [qAction, qActor, qTarget]);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, qAction, qActor, qTarget]);

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.audit.title") || "Audit Log"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.audit.subtitle") || "Trace all administrative actions for transparency."}
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

      <PremiumCard className="p-5">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="grid gap-2">
            <span className="text-xs text-white/55 inline-flex items-center gap-2">
              <Search className="w-4 h-4 text-white/45" />
              action
            </span>
            <input
              value={qAction}
              onChange={(e) => setQAction(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              placeholder="ADMIN_UPDATE_MEMBER…"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs text-white/55">actor_id</span>
            <input
              value={qActor}
              onChange={(e) => setQActor(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              placeholder="uuid…"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs text-white/55">target_id</span>
            <input
              value={qTarget}
              onChange={(e) => setQTarget(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              placeholder="uuid…"
            />
          </label>
        </div>

        <div className="mt-3 text-xs text-white/50">
          total: <span className="text-[#F0B90B] font-semibold">{total}</span> • page {page + 1}
        </div>
      </PremiumCard>

      <div className="grid gap-3">
        {rows.map((r) => {
          const open = !!expanded[r.id];
          return (
            <PremiumCard key={r.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white/90 font-semibold">
                    #{r.id} • {new Date(r.created_at).toLocaleString()}
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-white/75">
                    <div>
                      <span className="text-white/50">action:</span>{" "}
                      <span className="text-[#F0B90B]">{r.action}</span>
                    </div>
                    <div>
                      <span className="text-white/50">actor:</span>{" "}
                      <span className="text-white/85">{shortId(r.actor_id)}</span>
                    </div>
                    <div>
                      <span className="text-white/50">target:</span>{" "}
                      <span className="text-white/85">{shortId(r.target_id)}</span>{" "}
                      {r.target_id ? (
                        <a
                          className="text-xs text-white/55 hover:text-white underline"
                          href={`${baseAdmin}/member?id=${r.target_id}`}
                        >
                          View
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>

                <PremiumButton
                  variant="secondary"
                  onClick={() => setExpanded((m) => ({ ...m, [r.id]: !m[r.id] }))}
                >
                  {open ? "Hide payload" : "Show payload"}
                </PremiumButton>
              </div>

              {open ? (
                <div className="mt-4 rounded-2xl bg-black/30 border border-white/10 p-3 overflow-x-auto">
                  <pre className="text-xs text-white/75 whitespace-pre-wrap">
                    {JSON.stringify(r.payload ?? {}, null, 2)}
                  </pre>
                </div>
              ) : null}
            </PremiumCard>
          );
        })}

        {rows.length === 0 && !loading ? (
          <PremiumCard className="p-5">
            <div className="text-white/60">No audit logs.</div>
          </PremiumCard>
        ) : null}
      </div>

      <PremiumCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/50">
            showing {rows.length} of {total}
          </div>
          <div className="flex gap-2">
            <PremiumButton variant="secondary" disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Prev
              </span>
            </PremiumButton>
            <PremiumButton variant="secondary" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
              <span className="inline-flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </span>
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
