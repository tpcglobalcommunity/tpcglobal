import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { type Language, useI18n } from "../../i18n";
import { PremiumCard, PremiumButton, NoticeBox } from "../../components/ui";
import { BadgeCheck, Eye, CheckCircle, XCircle, RefreshCcw, User, Wallet } from "lucide-react";
import { approveVerification, rejectVerification } from "../../lib/adminRpc";
import { useMyRole, canManageVerification } from "../../hooks/useMyRole";
import { useActionCooldown } from "../../hooks/useActionCooldown";
import NotAuthorized from "../../components/NotAuthorized";

type Row = {
  id: number;
  created_at: string;
  user_id: string;
  wallet_address: string;
  status: string;
  notes?: string | null;
};

function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export default function VerificationQueuePage({ lang }: { lang: Language }) {
  const { t } = useI18n();
  const { role, loading: roleLoading } = useMyRole();
  const { isCoolingDown, setActionTime } = useActionCooldown();

  // Check if user has admin+ access
  if (!roleLoading && !canManageVerification(role)) {
    return <NotAuthorized lang={lang} message="Only administrators can manage verification requests." />;
  }

  console.log(lang); // Prevent unused variable warning

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  const [rejectOpen, setRejectOpen] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  const pendingCount = useMemo(() => rows.length, [rows]);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("id, created_at, user_id, wallet_address, status, notes")
        .eq("status", "REQUESTED")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRows((data || []) as Row[]);
    } catch (e: any) {
      setErr(e?.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function decide(id: number, decision: "APPROVE" | "REJECT", notes?: string) {
    setErr(null);
    setOk(null);
    setBusyId(id);
    
    try {
      if (decision === "APPROVE") {
        await approveVerification(id.toString());
        setOk("Verification request approved successfully.");
      } else {
        await rejectVerification(id.toString(), notes);
        setOk("Verification request rejected.");
      }
      setRejectOpen(null);
      setRejectNotes("");
      setActionTime(`verify-${id}`);
      await load();
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        setErr("Too many actions. Please wait a moment.");
        setTimeout(() => setErr(null), 5000);
      } else {
        setErr(e?.message || "Failed to update verification request");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white inline-flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-[#F0B90B]" />
            {t("admin.verifyQueue.title") || "Verification Queue"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {t("admin.verifyQueue.subtitle") || "Review wallet verification requests safely."}
          </p>
        </div>

        <PremiumButton variant="secondary" onClick={load} disabled={loading}>
          <span className="inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("admin.common.refresh") || "Refresh"}
          </span>
        </PremiumButton>
      </div>

      <div className="text-xs text-white/50">
        {t("admin.verifyQueue.pending") || "Pending requests"}:{" "}
        <span className="text-[#F0B90B] font-semibold">{pendingCount}</span>
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

      {rows.length === 0 ? (
        <PremiumCard className="p-5">
          <div className="text-white/70">
            {t("admin.verifyQueue.empty") || "No pending verification requests."}
          </div>
        </PremiumCard>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <PremiumCard key={r.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-white font-semibold">
                    #{r.id} • {new Date(r.created_at).toLocaleString()}
                  </div>

                  <div className="mt-2 grid gap-1 text-sm">
                    <div className="text-white/75 inline-flex items-center gap-2">
                      <User className="w-4 h-4 text-white/45" />
                      user: <button 
                        onClick={() => window.location.href = `/${lang}/admin/member?id=${r.user_id}`}
                        className="text-white/90 hover:text-[#F0B90B] underline"
                      >
                        {shortId(r.user_id)}
                      </button>
                    </div>
                    <div className="text-white/75 inline-flex items-center gap-2 break-all">
                      <Wallet className="w-4 h-4 text-white/45" />
                      wallet: <span className="text-white/90">{r.wallet_address}</span>
                    </div>
                    {r.notes ? (
                      <div className="text-xs text-white/55 mt-1">
                        notes: {r.notes}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <PremiumButton 
                    onClick={() => decide(r.id, "APPROVE")}
                    disabled={busyId === r.id || isCoolingDown(`verify-${r.id}`)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {busyId === r.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <BadgeCheck className="w-4 h-4" />
                      )}
                      {t("admin.verifyQueue.approve") || "Approve"}
                    </span>
                  </PremiumButton>

                  <PremiumButton
                    variant="secondary"
                    onClick={() => setRejectOpen(rejectOpen === r.id ? null : r.id)}
                    disabled={busyId === r.id || isCoolingDown(`verify-${r.id}`)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {t("admin.verifyQueue.reject") || "Reject"}
                    </span>
                  </PremiumButton>
                </div>
              </div>

              {rejectOpen === r.id ? (
                <div className="mt-4 grid gap-2">
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder={t("admin.verifyQueue.rejectPlaceholder") || "Reason (optional)..."}
                    className="min-h-[90px] px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#F0B90B]/40"
                  />
                  <div className="flex gap-2">
                    <PremiumButton
                      variant="secondary"
                      onClick={() => {
                        setRejectOpen(null);
                        setRejectNotes("");
                      }}
                    >
                      {t("admin.common.cancel") || "Cancel"}
                    </PremiumButton>
                    <PremiumButton onClick={() => decide(r.id, "REJECT", rejectNotes)} disabled={busyId === r.id || isCoolingDown(`verify-${r.id}`)}>
                      <span className="inline-flex items-center gap-2">
                        {busyId === r.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          t("admin.verifyQueue.confirmReject") || "Confirm reject"
                        )}
                      </span>
                    </PremiumButton>
                  </div>
                </div>
              ) : null}
            </PremiumCard>
          ))}
        </div>
      )}
    </div>
  );
}
