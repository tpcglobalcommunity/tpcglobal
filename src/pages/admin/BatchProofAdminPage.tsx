import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n";
import {
  ShieldCheck,
  Copy,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

type DistributionBatch = {
  id: string;
  created_at: string;
  period_start: string;
  period_end: string;
  tx_count: number;
  revenue_sum: string;
  referral_sum: string;
  treasury_sum: string;
  buyback_sum: string;
  public_hash: string | null;
  onchain_tx: string | null;
  note: string | null;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Button({
  children,
  onClick,
  disabled,
  variant = "gold",
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "gold" | "ghost" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const v =
    variant === "gold"
      ? "bg-[#F0B90B] text-black hover:brightness-110"
      : variant === "danger"
      ? "bg-rose-500/15 text-rose-200 border border-rose-400/20 hover:bg-rose-500/20"
      : "bg-white/5 text-white border border-white/10 hover:bg-white/8";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, v, className)}>
      {children}
    </button>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(240,185,11,0.06)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function BatchProofAdminPage() {
  const { t } = useI18n();
  const [batches, setBatches] = useState<DistributionBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [attaching, setAttaching] = useState<string | null>(null);
  const [txInput, setTxInput] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBatches = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_public_batches", { p_limit: 20 });
    
    if (error) {
      console.error("Error loading batches:", error);
    } else {
      setBatches(data || []);
    }
    setLoading(false);
  };

  const attachProof = async (batchId: string) => {
    const tx = txInput[batchId]?.trim();
    
    if (!tx || tx.length < 20) {
      setError("Transaction signature must be at least 20 characters");
      return;
    }

    setAttaching(batchId);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.rpc("admin_set_batch_onchain_tx", {
        p_batch_id: batchId,
        p_onchain_tx: tx,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(t("admin.batchProof.success"));
        setTxInput(prev => ({ ...prev, [batchId]: "" }));
        await loadBatches();
      }
    } catch (err) {
      setError("Failed to attach proof");
    }

    setAttaching(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-6 h-6 text-[#F0B90B]" />
            <h1 className="text-2xl font-bold">{t("admin.batchProof.title")}</h1>
          </div>
          <p className="text-white/60">
            Attach on-chain transaction proofs to distribution batches for complete verification
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span className="text-rose-200">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-200">{success}</span>
          </div>
        )}

        {/* Batches Table */}
        <Card>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                <span>Loading batches...</span>
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <div className="text-white/60">No distribution batches found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60">Batch ID</th>
                      <th className="text-left py-3 px-4 text-white/60">Created</th>
                      <th className="text-left py-3 px-4 text-white/60">Transactions</th>
                      <th className="text-left py-3 px-4 text-white/60">Snapshot Hash</th>
                      <th className="text-left py-3 px-4 text-white/60">{t("admin.batchProof.txLabel")}</th>
                      <th className="text-left py-3 px-4 text-white/60">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono">
                            {batch.id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white/80">
                            {new Date(batch.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-white/50">
                            {new Date(batch.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white/80">{batch.tx_count}</div>
                        </td>
                        <td className="py-3 px-4">
                          {batch.public_hash ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono text-emerald-300">
                                {batch.public_hash.slice(0, 10)}...
                              </code>
                              <Button
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                onClick={() => copyToClipboard(batch.public_hash)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-amber-300">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {batch.onchain_tx ? (
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono text-blue-300">
                                {batch.onchain_tx.slice(0, 10)}...
                              </code>
                              <Button
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                onClick={() => copyToClipboard(batch.onchain_tx)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                className="p-1 h-6 w-6"
                                onClick={() => window.open(`https://solscan.io/tx/${batch.onchain_tx}`, "_blank")}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not attached</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Enter transaction signature..."
                              value={txInput[batch.id] || ""}
                              onChange={(e) => setTxInput(prev => ({ ...prev, [batch.id]: e.target.value }))}
                              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#F0B90B]/40 w-64"
                              disabled={attaching === batch.id}
                            />
                            <Button
                              onClick={() => attachProof(batch.id)}
                              disabled={attaching === batch.id || !txInput[batch.id]?.trim()}
                              className="gap-2"
                            >
                              {attaching === batch.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : null}
                              {t("admin.batchProof.attach")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
