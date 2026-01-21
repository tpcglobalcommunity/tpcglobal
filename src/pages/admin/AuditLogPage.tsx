import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { ScrollText, Search, RefreshCcw, ArrowLeft, ArrowRight, Download } from "lucide-react";
import { downloadCSV, formatDateForFilename } from "../../lib/csv";
import { downloadTextFile } from "../../lib/download";

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
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 25;

  // Search state
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0); // Reset to first page when search changes
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < Math.ceil(total / pageSize) - 1;

  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const { data, error } = await supabase.rpc("admin_search_audit_logs", {
        p_q: debouncedQuery || null,
        p_action: actionFilter || null,
        p_limit: pageSize,
        p_offset: pageIndex * pageSize
      });

      if (error) throw error;

      // Extract total_count from first row or default to 0
      const totalCount = data && data.length > 0 ? data[0].total_count : 0;
      
      // Convert RPC result to Row format
      const auditRows = (data || []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        actor_id: row.actor_id,
        action: row.action,
        target_id: row.target_id,
        payload: row.payload
      }));

      setRows(auditRows);
      setTotal(totalCount);
    } catch (e: any) {
      setErr(e.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [debouncedQuery, actionFilter, pageIndex]);

  async function exportCSV() {
    try {
      setLoading(true);
      setErr(null);

      // Use RPC to export filtered audit logs
      const { data, error } = await supabase.rpc("admin_export_audit_logs", {
        p_q: debouncedQuery || null,
        p_action: actionFilter || null,
        p_limit: 5000
      });

      if (error) throw error;

      // Define CSV headers
      const headers = [
        "id",
        "created_at",
        "actor_id",
        "action",
        "target_id",
        "payload"
      ];

      // Generate filename with timestamp
      const filename = `tpc-audit-logs-${formatDateForFilename()}.csv`;

      // Convert payload to JSON string for CSV
      const csvData = (data || []).map((row: any) => ({
        ...row,
        payload: JSON.stringify(row.payload || {})
      }));

      // Download CSV using helper
      downloadCSV(filename, csvData, headers);

      setErr(null);
    } catch (e: any) {
      setErr(e.message || "Failed to export audit logs");
    } finally {
      setLoading(false);
    }
  }

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

        <div className="flex gap-2">
        <PremiumButton variant="secondary" onClick={exportCSV} disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("admin.common.export") || "Export"}
          </span>
        </PremiumButton>
        <PremiumButton variant="secondary" onClick={load} disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("admin.common.refresh") || "Refresh"}
          </span>
        </PremiumButton>
      </div>
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

        <div className="mt-3 text-xs text-white/50 flex justify-between items-center">
          <span>total: <span className="text-[#F0B90B] font-semibold">{total}</span> • page {pageIndex + 1}</span>
          <PremiumButton
            variant="secondary"
            onClick={exportCSV}
            disabled={loading}
            size="sm"
          >
            <span className="inline-flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </span>
          </PremiumButton>
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
