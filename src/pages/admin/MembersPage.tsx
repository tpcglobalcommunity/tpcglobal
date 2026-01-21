import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n, getLangPath } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import {
  Users,
  Search,
  RefreshCcw,
  Download,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";
import { updateMember } from "../../lib/adminRpc";

type MemberRow = {
  id: string;
  email?: string | null;
  username?: string | null;
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
};

const PAGE_SIZE = 20;

function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export default function MembersPage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const baseAdmin = `${getLangPath(lang, "")}/admin`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [rows, setRows] = useState<MemberRow[]>([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  async function load() {
    setLoading(true);
    setError(null);

    try {
      let q = supabase
        .from("profiles")
        .select(
          "id,email,username,full_name,role,status,verified,created_at",
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (query.trim()) {
        const like = `%${query.trim()}%`;
        q = q.or(
          [
            `id.ilike.${like}`,
            `username.ilike.${like}`,
            `full_name.ilike.${like}`,
            `email.ilike.${like}`,
          ].join(",")
        );
      }

      const { data, error, count } = await q;
      if (error) throw error;

      setRows((data || []) as MemberRow[]);
      setTotal(count || 0);
    } catch (e: any) {
      setError(e.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  function exportCSV() {
    const headers = [
      "id",
      "email",
      "username",
      "full_name",
      "role",
      "status",
      "verified",
      "created_at",
    ];

    const lines = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify((r as any)[h] ?? "")).join(",")
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `tpc_members_page_${page + 1}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  const canPrev = page > 0;
  const canNext = from + rows.length < total;

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.members.title") || "Members"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.members.subtitle") || "Search and manage registered members."}
          </p>
        </div>

        <div className="flex gap-2">
          <PremiumButton variant="secondary" onClick={load} disabled={loading}>
            <RefreshCcw className="w-4 h-4" />
          </PremiumButton>
          <PremiumButton onClick={exportCSV} disabled={!rows.length}>
            <Download className="w-4 h-4" />
          </PremiumButton>
        </div>
      </div>

      {error && (
        <NoticeBox variant="warning">
          <div className="text-sm text-white/85">{error}</div>
        </NoticeBox>
      )}

      {success && (
        <NoticeBox variant="success">
          <div className="text-sm text-white/85">{success}</div>
        </NoticeBox>
      )}

      {/* Search */}
      <PremiumCard className="p-4">
        <label className="grid gap-2">
          <span className="text-xs text-white/55 inline-flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </span>
          <input
            value={query}
            onChange={(e) => {
              setPage(0);
              setQuery(e.target.value);
            }}
            className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
            placeholder="id, username, email, name…"
          />
        </label>
      </PremiumCard>

      {/* Table */}
      <PremiumCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {r.username || r.full_name || r.email || shortId(r.id)}
                    </div>
                    <div className="text-xs text-white/45">
                      {shortId(r.id)}
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{r.role}</td>
                  <td className="px-4 py-3">{String(!!r.verified)}</td>
                  <td className="px-4 py-3 text-xs text-white/60">
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        onClick={() => (window.location.href = `${baseAdmin}/member?id=${r.id}`)}
                        disabled={busyId === r.id}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </span>
                      </PremiumButton>
                      
                      {r.verified ? (
                        <PremiumButton
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            if (busyId === r.id) return;
                            setBusyId(r.id);
                            setSuccess(null);
                            setError(null);
                            try {
                              await updateMember({
                                userId: r.id,
                                verified: false,
                              });
                              setSuccess(`Member ${r.username || r.email || shortId(r.id)} verification removed`);
                              await load();
                            } catch (e: any) {
                              setError(e?.message || "Failed to update member");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          disabled={busyId === r.id}
                        >
                          <span className="inline-flex items-center gap-2">
                            {busyId === r.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Unverify"
                            )}
                          </span>
                        </PremiumButton>
                      ) : (
                        <PremiumButton
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            if (busyId === r.id) return;
                            setBusyId(r.id);
                            setSuccess(null);
                            setError(null);
                            try {
                              await updateMember({
                                userId: r.id,
                                verified: true,
                              });
                              setSuccess(`Member ${r.username || r.email || shortId(r.id)} verified successfully`);
                              await load();
                            } catch (e: any) {
                              setError(e?.message || "Failed to update member");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          disabled={busyId === r.id}
                        >
                          <span className="inline-flex items-center gap-2">
                            {busyId === r.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </span>
                        </PremiumButton>
                      )}
                      
                      {r.status === "BANNED" ? (
                        <PremiumButton
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            if (busyId === r.id) return;
                            setBusyId(r.id);
                            setSuccess(null);
                            setError(null);
                            try {
                              await updateMember({
                                userId: r.id,
                                status: "ACTIVE",
                              });
                              setSuccess(`Member ${r.username || r.email || shortId(r.id)} activated`);
                              await load();
                            } catch (e: any) {
                              setError(e?.message || "Failed to update member");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          disabled={busyId === r.id}
                        >
                          <span className="inline-flex items-center gap-2">
                            {busyId === r.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Activate"
                            )}
                          </span>
                        </PremiumButton>
                      ) : (
                        <PremiumButton
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            if (busyId === r.id) return;
                            setBusyId(r.id);
                            setSuccess(null);
                            setError(null);
                            try {
                              await updateMember({
                                userId: r.id,
                                status: "BANNED",
                              });
                              setSuccess(`Member ${r.username || r.email || shortId(r.id)} banned`);
                              await load();
                            } catch (e: any) {
                              setError(e?.message || "Failed to update member");
                            } finally {
                              setBusyId(null);
                            }
                          }}
                          disabled={busyId === r.id}
                        >
                          <span className="inline-flex items-center gap-2">
                            {busyId === r.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Ban"
                            )}
                          </span>
                        </PremiumButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!rows.length && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-white/60"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
          <div className="text-xs text-white/50">
            Page {page + 1} • Total {total}
          </div>
          <div className="flex gap-2">
            <PremiumButton
              variant="secondary"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ArrowLeft className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
            >
              <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
