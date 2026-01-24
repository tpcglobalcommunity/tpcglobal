import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { type Language, useI18n } from "@/i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { RefreshCcw, Mail, CheckCircle, XCircle, AlertCircle, Clock, Send } from "lucide-react";
import { useMyRole, canManageSystem } from "../../hooks/useMyRole";
import NotAuthorized from "@/components/NotAuthorized";

type EmailRow = {
  id: number;
  to_email: string;
  subject: string;
  template: string;
  variables: any;
  status: string;
  attempt_count: number;
  created_at: string;
  next_attempt_at: string;
  last_attempt_at: string;
  last_error: string;
  locked_at: string;
  locked_by: string;
  lock_duration_minutes?: number;
  health_status: string;
};

type StatusFilter = "ALL" | "PENDING" | "SENT" | "FAILED" | "CANCELLED";

export default function EmailQueuePage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const { role, loading: roleLoading } = useMyRole();

  // Check if user has super admin access
  if (!roleLoading && !canManageSystem(role)) {
    return <NotAuthorized lang={lang} message="Only super administrators can manage email queue." />;
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<EmailRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Load email queue data
  async function load() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase
        .rpc("admin_get_email_queue_details");

      if (error) throw error;
      setRows((data || []) as EmailRow[]);
    } catch (e: any) {
      setError(e?.message || "Failed to load email queue");
    } finally {
      setLoading(false);
    }
  }

  // Filter rows based on status
  const filteredRows = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter(row => row.status === statusFilter);
  }, [rows, statusFilter]);

  // Status badge colors
  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "SENT": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "FAILED": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "CANCELLED": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-white/10 text-white/70 border-white/20";
    }
  }

  // Status badge icons
  function getStatusIcon(status: string) {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "SENT": return <CheckCircle className="w-4 h-4" />;
      case "FAILED": return <XCircle className="w-4 h-4" />;
      case "CANCELLED": return <AlertCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  }

  // Retry single email
  async function retryEmail(id: number) {
    if (!confirm("Retry this email? This will reset it to PENDING for processing.")) {
      return;
    }

    try {
      setBusyId(id);
      await supabase.rpc("admin_retry_email", { p_id: id });
      setSuccess("Email queued for retry");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to retry email");
    } finally {
      setBusyId(null);
    }
  }

  // Cancel single email
  async function cancelEmail(id: number) {
    if (!confirm("Cancel this email? This will mark it as CANCELLED.")) {
      return;
    }

    try {
      setBusyId(id);
      await supabase.rpc("admin_cancel_email", { p_id: id });
      setSuccess("Email cancelled successfully");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to cancel email");
    } finally {
      setBusyId(null);
    }
  }

  // Bulk retry selected emails
  async function bulkRetrySelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setError("No emails selected for retry");
      return;
    }

    if (!confirm(`Retry ${ids.length} selected emails? This will reset them to PENDING for processing.`)) {
      return;
    }

    try {
      setBusyId(-1); // Use -1 for bulk operations
      const { data } = await supabase.rpc("admin_bulk_retry_emails", { p_ids: ids });
      setSuccess(`${data} emails queued for retry`);
      setSelectedIds(new Set());
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to retry emails");
    } finally {
      setBusyId(null);
    }
  }

  // Bulk cancel selected emails
  async function bulkCancelSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setError("No emails selected for cancellation");
      return;
    }

    if (!confirm(`Cancel ${ids.length} selected emails? This will mark them as CANCELLED.`)) {
      return;
    }

    try {
      setBusyId(-1); // Use -1 for bulk operations
      const { data } = await supabase.rpc("admin_bulk_cancel_emails", { p_ids: ids });
      setSuccess(`${data} emails cancelled`);
      setSelectedIds(new Set());
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to cancel emails");
    } finally {
      setBusyId(null);
    }
  }

  // Toggle selection
  function toggleSelection(id: number) {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  // Toggle all selection
  function toggleSelectAll() {
    if (selectedIds.size === filteredRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map(row => row.id)));
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: rows.length,
      PENDING: rows.filter(r => r.status === "PENDING").length,
      SENT: rows.filter(r => r.status === "SENT").length,
      FAILED: rows.filter(r => r.status === "FAILED").length,
      CANCELLED: rows.filter(r => r.status === "CANCELLED").length,
    };
    return counts;
  }, [rows]);

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.emailQueue.title") || "Email Queue Monitor"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.emailQueue.subtitle") || "Monitor and manage email delivery queue."}
          </p>
        </div>

        <div className="flex gap-2">
          <PremiumButton variant="secondary" onClick={load} disabled={loading}>
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              {t("admin.common.refresh") || "Refresh"}
            </span>
          </PremiumButton>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {(["ALL", "PENDING", "SENT", "FAILED", "CANCELLED"] as StatusFilter[]).map(status => (
          <PremiumButton
            key={status}
            variant={statusFilter === status ? "default" : "secondary"}
            onClick={() => setStatusFilter(status)}
            className="px-3 py-2 text-sm"
          >
            {status} ({statusCounts[status]})
          </PremiumButton>
        ))}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-white/70">
        <div>
          <span className="text-white/50">Total:</span>
          <span className="font-semibold text-white">{statusCounts.ALL}</span>
        </div>
        <div>
          <span className="text-white/50">Pending:</span>
          <span className="font-semibold text-yellow-400">{statusCounts.PENDING}</span>
        </div>
        <div>
          <span className="text-white/50">Sent:</span>
          <span className="font-semibold text-green-400">{statusCounts.SENT}</span>
        </div>
        <div>
          <span className="text-white/50">Failed:</span>
          <span className="font-semibold text-red-400">{statusCounts.FAILED}</span>
        </div>
        <div>
          <span className="text-white/50">Cancelled:</span>
          <span className="font-semibold text-gray-400">{statusCounts.CANCELLED}</span>
        </div>
      </div>

      {/* Bulk Actions */}
      {statusFilter === "PENDING" && (
        <div className="flex gap-2">
          <PremiumButton
            onClick={bulkRetrySelected}
            disabled={selectedIds.size === 0 || busyId !== null}
            className="bg-green-500/20 text-green-400 border-green-500/30"
          >
            <span className="inline-flex items-center gap-2">
              <Send className="w-4 h-4" />
              {t("admin.emailQueue.bulkRetry") || "Retry Selected"}
            </span>
          </PremiumButton>
          <PremiumButton
            onClick={bulkCancelSelected}
            disabled={selectedIds.size === 0 || busyId !== null}
            className="bg-red-500/20 text-red-400 border-red-500/30"
          >
            <span className="inline-flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {t("admin.emailQueue.bulkCancel") || "Cancel Selected"}
            </span>
          </PremiumButton>
        </div>
      )}

      {/* Error and Success Messages */}
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

      {/* Loading State */}
      {loading ? (
        <PremiumCard className="p-5">
          <div className="text-center text-white/60">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
            {t("admin.emailQueue.loading") || "Loading email queue..."}
          </div>
        </PremiumCard>
      ) : filteredRows.length === 0 ? (
        <PremiumCard className="p-5">
          <div className="text-center text-white/60">
            <Mail className="w-12 h-12 text-white/30 mx-auto mb-2" />
            {t("admin.emailQueue.empty") || "No emails found"}
          </div>
        </PremiumCard>
      ) : (
        <div className="grid gap-3">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredRows.length}
              onChange={() => toggleSelectAll()}
              className="w-4 h-4"
            />
            <span className="text-white/70 text-sm">
              {t("admin.emailQueue.selectAll") || "Select All"}
            </span>
          </div>

          {/* Selected Count */}
          {selectedIds.size > 0 && (
            <span className="px-2 py-1 text-xs bg-[#F0B90B]/20 text-[#F0B90B] rounded-full">
              {selectedIds.size} {t("admin.emailQueue.selected") || "selected"}
            </span>
          )}

          {/* Email List */}
          <div className="space-y-2">
            {filteredRows.map((row) => (
              <PremiumCard
                key={row.id}
                className={`p-4 transition-all ${
                  row.locked_at ? "bg-yellow-500/10 border-yellow-500/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelection(row.id)}
                      className="w-4 h-4"
                    />
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(row.status)}`}>
                      {row.status}
                    </span>
                    {getStatusIcon(row.status)}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span>{row.id}</span>
                      <span>{row.attempt_count} attempts</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div>
                    <div className="font-medium text-white">{row.subject}</div>
                    <div className="text-sm text-white/70">{row.to_email}</div>
                  </div>
                  <div className="text-xs text-white/50">
                    {row.template}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-white/50">
                    Created: {new Date(row.created_at).toLocaleString()}
                  </div>
                  {row.next_attempt_at && (
                    <div className="text-xs text-white/50">
                      Next Attempt: {new Date(row.next_attempt_at).toLocaleString()}
                    </div>
                  )}
                  {row.last_attempt_at && (
                    <div className="text-xs text-white/50">
                      Last Attempt: {new Date(row.last_attempt_at).toLocaleString()}
                    </div>
                  )}
                  {row.locked_at && (
                    <div className="text-xs text-white/50">
                      Locked: {new Date(row.locked_at).toLocaleString()}
                    </div>
                  )}
                  {row.locked_by && (
                    <div className="text-xs text-white/50">
                      Locked By: {row.locked_by}
                    </div>
                  )}
                  {row.lock_duration_minutes && (
                    <div className="text-xs text-white/50">
                      Lock Duration: {row.lock_duration_minutes}m
                    </div>
                  )}
                  {row.health_status && (
                    <div className="text-xs text-white/50">
                      Health: {row.health_status}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {row.last_error && (
                    <div className="text-xs text-red-400 p-2 rounded bg-red-500/20 border-red-500/30">
                      Error: {row.last_error}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  {row.status === "PENDING" && (
                    <PremiumButton
                      size="sm"
                      onClick={() => retryEmail(row.id)}
                      disabled={busyId === row.id}
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        {t("admin.emailQueue.retry") || "Retry"}
                      </span>
                    </PremiumButton>
                  )}

                  {row.status === "PENDING" && (
                    <PremiumButton
                      size="sm"
                      variant="secondary"
                      onClick={() => cancelEmail(row.id)}
                      disabled={busyId === row.id}
                    >
                      <span className="inline-flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {t("admin.emailQueue.cancel") || "Cancel"}
                      </span>
                    </PremiumButton>
                  )}

                  {row.status === "FAILED" && (
                    <PremiumButton
                      size="sm"
                      onClick={() => retryEmail(row.id)}
                      disabled={busyId === row.id}
                    >
                      <span className="inline-flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        {t("admin.emailQueue.retry") || "Retry"}
                      </span>
                    </PremiumButton>
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
