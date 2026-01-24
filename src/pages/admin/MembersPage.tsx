import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Language, useI18n, getLangPath } from "@/i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import {
  Users,
  Search,
  RefreshCcw,
  Download,
  ArrowLeft,
  ArrowRight,
  Eye,
} from "lucide-react";
import { updateMember } from "@/lib/adminRpc";
import { downloadCSV, formatDateForFilename } from "@/lib/csv";
import { downloadTextFile } from "@/lib/download";
import { useMyRole, canEditMembers } from "../../hooks/useMyRole";
import NotAuthorized from "@/components/NotAuthorized";

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
  const { t } = useI18n(lang);
  const baseAdmin = `${getLangPath(lang, "")}/admin`;
  const { role, loading: roleLoading } = useMyRole();

  // Check if user has viewer+ access
  if (!roleLoading && !role) {
    return <NotAuthorized lang={lang} message="You need admin access to view this page." />;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Search and pagination state
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0); // Reset to first page when search changes
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc("admin_search_members", {
        p_q: debouncedQuery || null,
        p_status: statusFilter || null,
        p_role: roleFilter || null,
        p_verified: verifiedFilter === "true" ? true : verifiedFilter === "false" ? false : null,
        p_limit: pageSize,
        p_offset: pageIndex * pageSize
      });

      if (error) throw error;

      // Extract total_count from first row or default to 0
      const totalCount = data && data.length > 0 ? data[0].total_count : 0;
      
      // Convert RPC result to MemberRow format
      const memberRows = (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        username: row.username,
        full_name: row.full_name,
        role: row.role,
        verified: row.verified,
        created_at: row.created_at
      }));

      setRows(memberRows);
      setTotal(totalCount);
    } catch (e: any) {
      setError(e.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [debouncedQuery, statusFilter, roleFilter, verifiedFilter, pageIndex]);

  async function exportCSV() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Use RPC to export filtered members
      const { data, error } = await supabase.rpc("admin_export_members", {
        p_q: debouncedQuery || null,
        p_status: statusFilter || null,
        p_role: roleFilter || null,
        p_verified: verifiedFilter === "true" ? true : verifiedFilter === "false" ? false : null,
        p_limit: 5000
      });

      if (error) throw error;

      // Define CSV headers
      const headers = [
        "id",
        "email",
        "full_name", 
        "username",
        "role",
        "verified",
        "can_invite",
        "created_at"
      ];

      // Generate filename with timestamp
      const filename = `tpc-members-${formatDateForFilename()}.csv`;

      // Download CSV using helper
      downloadCSV(filename, data || [], headers);

      setSuccess(`Exported ${data?.length || 0} members successfully`);
    } catch (e: any) {
      setError(e.message || "Failed to export members");
    } finally {
      setLoading(false);
    }
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

      {/* Search and Filters */}
      <PremiumCard className="p-4">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <label className="grid gap-2">
                <span className="text-xs text-white/55 inline-flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  placeholder="id, username, email, name…"
                />
              </label>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="BANNED">Banned</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              >
                <option value="">All Roles</option>
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value);
                  setPageIndex(0);
                }}
                className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
              >
                <option value="">All Verified</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>
          
          {/* Total Count */}
          <div className="text-sm text-white/70">
            Total: <span className="text-[#F0B90B] font-semibold">{total}</span> members
          </div>
        </div>
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
            Page {pageIndex + 1} of {Math.ceil(total / pageSize)} • Total {total}
          </div>
          <div className="flex gap-2">
            <PremiumButton
              variant="secondary"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              <ArrowLeft className="w-4 h-4" />
            </PremiumButton>
            <PremiumButton
              variant="secondary"
              disabled={pageIndex >= Math.ceil(total / pageSize) - 1}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              <ArrowRight className="w-4 h-4" />
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
