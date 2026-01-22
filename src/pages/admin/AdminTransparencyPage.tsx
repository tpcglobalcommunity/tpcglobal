import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useMyRole } from "../../hooks/useMyRole";
import {
  ShieldCheck,
  FileText,
  Hash,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";

type FormData = {
  title: string;
  body: string;
  category: string;
  tx_hash: string;
  amount: string;
  token_symbol: string;
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
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

function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "error";
  title: string;
  children?: React.ReactNode;
}) {
  const icon =
    tone === "success" ? (
      <div className="w-4 h-4 text-emerald-400">✓</div>
    ) : tone === "error" ? (
      <div className="w-4 h-4 text-rose-400">✕</div>
    ) : (
      <div className="w-4 h-4 text-[#F0B90B]">ℹ</div>
    );

  const klass =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : tone === "error"
      ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
      : "border-[#F0B90B]/25 bg-[#F0B90B]/10 text-white";

  return (
    <div className={cn("rounded-2xl border p-4", klass)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 opacity-90">{icon}</div>
        <div>
          <div className="font-semibold">{title}</div>
          {children ? <div className="text-sm opacity-90 mt-1">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "buyback", label: "Buyback" },
  { value: "burn", label: "Burn" },
  { value: "liquidity", label: "Liquidity" },
  { value: "ops", label: "Operations" },
];

export default function AdminTransparencyPage() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useMyRole();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    body: "",
    category: "general",
    tx_hash: "",
    amount: "",
    token_symbol: "",
  });

  useEffect(() => {
    if (!roleLoading && (role !== 'admin' && role !== 'super_admin')) {
      navigate("/admin");
    }
  }, [role, roleLoading, navigate]);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Title and body are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: rpcError } = await supabase.rpc("admin_add_transparency_update", {
        p_title: formData.title.trim(),
        p_body: formData.body.trim(),
        p_category: formData.category,
        p_tx_hash: formData.tx_hash.trim() || null,
        p_amount: formData.amount ? Number(formData.amount) : null,
        p_token_symbol: formData.token_symbol.trim() || null,
        p_chain: "solana",
      });

      if (rpcError) throw rpcError;

      setSuccess("Transparency update added successfully!");
      setFormData({
        title: "",
        body: "",
        category: "general",
        tx_hash: "",
        amount: "",
        token_symbol: "",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to add transparency update");
    } finally {
      setSubmitting(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F0B90B]/25 bg-[#F0B90B]/10 px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-white/90">Admin • Transparency</span>
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">
            Add Transparency Update
          </h1>
          <p className="mt-2 text-white/70">
            Publish transparency updates for community visibility. All updates are publicly viewable and permanently recorded.
          </p>
        </div>

        {/* Notices */}
        <div className="space-y-3 mb-6">
          {error && (
            <Notice tone="error" title="Error">
              {error}
            </Notice>
          )}
          {success && (
            <Notice tone="success" title="Success">
              {success}
            </Notice>
          )}
          <Notice tone="info" title="Guidelines">
            All transparency updates are public and permanent. Include transaction hashes for verifiability when applicable.
          </Notice>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-sm text-white/80 font-semibold">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  placeholder="e.g., Weekly Treasury Update"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/80 font-semibold">Body *</label>
                <textarea
                  value={formData.body}
                  onChange={handleInputChange("body")}
                  placeholder="Detailed description of the update..."
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/80 font-semibold">Category</label>
                <select
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/80 font-semibold">Transaction Hash</label>
                <input
                  type="text"
                  value={formData.tx_hash}
                  onChange={handleInputChange("tx_hash")}
                  placeholder="Solana transaction hash (optional)"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 font-semibold">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange("amount")}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40"
                />
              </div>

              <div>
                <label className="text-sm text-white/80 font-semibold">Token Symbol</label>
                <input
                  type="text"
                  value={formData.token_symbol}
                  onChange={handleInputChange("token_symbol")}
                  placeholder="e.g., USDC, SOL, TPC"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-[#F0B90B]/40"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                type="button"
                onClick={() => navigate("/admin")}
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Publishing..." : "Publish Update"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Quick Links */}
        <div className="mt-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ExternalLink className="w-5 h-5 text-[#F0B90B]" />
                <div>
                  <div className="font-semibold">Quick Links</div>
                  <div className="text-sm text-white/60">Helpful resources</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">Solscan:</span>
                  <a 
                    href="https://solscan.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#F0B90B] hover:underline"
                  >
                    solscan.io
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">Public Transparency:</span>
                  <a 
                    href="/en/public/transparency" 
                    className="text-[#F0B90B] hover:underline"
                  >
                    View Public Page
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
