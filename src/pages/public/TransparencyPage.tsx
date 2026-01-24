import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Wallet,
  ExternalLink,
  Copy,
  Filter,
  Calendar,
  Hash,
  DollarSign,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Flame,
  Droplets,
  Settings,
  FileText,
} from "lucide-react";

type OfficialWallet = {
  id: number;
  name: string;
  chain: string;
  address: string;
  purpose: string;
  explorer_url: string | null;
  is_active: boolean;
  created_at: string;
};

type TransparencyUpdate = {
  id: number;
  title: string;
  body: string;
  category: string;
  tx_hash: string | null;
  amount: number | null;
  token_symbol: string | null;
  chain: string;
  created_at: string;
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

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "gold" | "green" | "red" | "blue" | "purple";
}) {
  const klass =
    tone === "gold"
      ? "bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]"
      : tone === "green"
      ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
      : tone === "red"
      ? "bg-rose-500/10 border-rose-400/30 text-rose-300"
      : tone === "blue"
      ? "bg-sky-500/10 border-sky-400/30 text-sky-300"
      : tone === "purple"
      ? "bg-purple-500/10 border-purple-400/30 text-purple-300"
      : "bg-white/5 border-white/10 text-white/70";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold", klass)}>
      {children}
    </span>
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

const CATEGORIES = ["ALL", "general", "buyback", "burn", "liquidity", "ops"] as const;

const CATEGORY_ICONS = {
  general: FileText,
  buyback: TrendingUp,
  burn: Flame,
  liquidity: Droplets,
  ops: Settings,
};

const CATEGORY_COLORS = {
  general: "blue",
  buyback: "green", 
  burn: "red",
  liquidity: "purple",
  ops: "neutral",
} as const;

export default function TransparencyPage() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<OfficialWallet[]>([]);
  const [updates, setUpdates] = useState<TransparencyUpdate[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const filteredUpdates = useMemo(() => {
    if (categoryFilter === "ALL") return updates;
    return updates.filter(u => u.category === categoryFilter);
  }, [updates, categoryFilter]);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const buildExplorerUrl = (address: string) => {
    return `https://solscan.io/account/${address}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadWallets = async () => {
    const { data, error } = await supabase
      .from("official_wallets")
      .select("*")
      .eq("is_active", true)
      .order("id");

    if (error) {
      console.error("Error loading wallets:", error);
      return;
    }
    setWallets(data || []);
  };

  const loadUpdates = async (loadMore = false) => {
    const limit = 20;
    const offset = loadMore ? updates.length : 0;

    const { data, error } = await supabase
      .from("public_transparency_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error loading updates:", error);
      return;
    }

    const newUpdates = data || [];
    if (loadMore) {
      setUpdates(prev => [...prev, ...newUpdates]);
    } else {
      setUpdates(newUpdates);
    }
    setHasMore(newUpdates.length === limit);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadUpdates(true);
    setLoadingMore(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadWallets(), loadUpdates()]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading transparency data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F0B90B]/25 bg-[#F0B90B]/10 px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-white/90">Public Transparency</span>
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            Complete Transparency & Trust
          </h1>
          <p className="mt-2 text-white/70 max-w-3xl">
            Full visibility into our official wallets, treasury operations, and all protocol activities. 
            Every transaction is verifiable on-chain.
          </p>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                  <div className="font-semibold">100% Transparent</div>
                  <div className="text-sm text-white/60">All wallets public</div>
                </div>
              </div>
              <p className="text-sm text-white/70">
                All official wallet addresses are publicly disclosed and verifiable on Solana blockchain.
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold">Real-time Updates</div>
                  <div className="text-sm text-white/60">Live tracking</div>
                </div>
              </div>
              <p className="text-sm text-white/70">
                All treasury operations, buybacks, burns, and liquidity movements are updated in real-time.
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <div className="font-semibold">On-chain Verifiable</div>
                  <div className="text-sm text-white/60">Transaction hashes</div>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Every update includes transaction hashes for independent verification on Solana explorer.
              </p>
            </div>
          </Card>
        </div>

        {/* Official Wallets */}
        <Card className="mb-8">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#F0B90B]" />
              <div>
                <div className="font-semibold">Official Wallets</div>
                <div className="text-sm text-white/60">All active protocol wallets</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-sm">{wallet.name}</div>
                      <div className="text-xs text-white/60 mt-1">{wallet.purpose}</div>
                    </div>
                    <Badge tone="blue">{wallet.chain.toUpperCase()}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-xs bg-white/10 px-2 py-1 rounded font-mono">
                      {shortAddress(wallet.address)}
                    </code>
                    <Button
                      variant="ghost"
                      className="p-1 h-6 w-6"
                      onClick={() => copyToClipboard(wallet.address)}
                    >
                      {copiedAddress === wallet.address ? (
                        <div className="w-3 h-3 text-emerald-400">✓</div>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => window.open(wallet.explorer_url || buildExplorerUrl(wallet.address), "_blank")}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Explorer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Transparency Updates */}
        <Card>
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#F0B90B]" />
                <div>
                  <div className="font-semibold">Transparency Updates</div>
                  <div className="text-sm text-white/60">Latest protocol activities</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/60" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#F0B90B]/40"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === "ALL" ? "All Categories" : cat.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredUpdates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <div className="text-white/60">No updates found</div>
                <div className="text-sm text-white/40 mt-1">
                  {categoryFilter !== "ALL" ? "Try selecting a different category" : "Updates will appear here"}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUpdates.map((update) => {
                  const Icon = CATEGORY_ICONS[update.category as keyof typeof CATEGORY_ICONS] || FileText;
                  const color = CATEGORY_COLORS[update.category as keyof typeof CATEGORY_COLORS] || "neutral";
                  
                  return (
                    <div key={update.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-white/60" />
                          <Badge tone={color as any}>{update.category.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Calendar className="w-3 h-3" />
                          {new Date(update.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-semibold mb-2">{update.title}</div>
                        <div className="text-sm text-white/70 whitespace-pre-wrap">{update.body}</div>
                      </div>
                      
                      {(update.tx_hash || update.amount) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {update.tx_hash && (
                            <Button
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => window.open(`https://solscan.io/tx/${update.tx_hash}`, "_blank")}
                            >
                              <Hash className="w-3 h-3" />
                              {shortAddress(update.tx_hash)}
                            </Button>
                          )}
                          
                          {update.amount && update.token_symbol && (
                            <div className="flex items-center gap-1 text-emerald-400">
                              <DollarSign className="w-3 h-3" />
                              <span>{update.amount.toLocaleString()} {update.token_symbol}</span>
                            </div>
                          )}
                          
                          <Badge tone="neutral">{update.chain.toUpperCase()}</Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {hasMore && filteredUpdates.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="w-full md:w-auto"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
