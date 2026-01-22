import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useMyRole } from "../../hooks/useMyRole";
import {
  Wallet,
  RefreshCw,
  Lock,
  Crown,
  Star,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Global type for Phantom wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        connect: () => Promise<{ publicKey: { toString(): string } }>;
      };
    };
  }
}

type Profile = {
  id: string;
  tpc_tier: "BASIC" | "PRO" | "ELITE";
  tpc_balance: number;
  wallet_verified_at: string | null;
};

type UserWallet = {
  id: number;
  wallet_address: string;
  is_primary: boolean;
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

function NoticeBox({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#F0B90B]/25 bg-[#F0B90B]/10 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-[#F0B90B]">{icon}</div>
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="text-sm text-white/80 mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function TierGate({
  title,
  description,
  requiredTier,
  currentTier,
  children,
}: {
  title: string;
  description: string;
  requiredTier: "PRO" | "ELITE";
  currentTier: "BASIC" | "PRO" | "ELITE";
  children: React.ReactNode;
}) {
  const tierOrder = { BASIC: 1, PRO: 2, ELITE: 3 };
  const meetsRequirement = tierOrder[currentTier] >= tierOrder[requiredTier];

  return (
    <Card className={cn(!meetsRequirement && "opacity-50")}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-semibold text-lg mb-1">{title}</div>
            <div className="text-sm text-white/70">{description}</div>
          </div>
          <div className="flex items-center gap-2">
            {meetsRequirement ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Lock className="w-5 h-5 text-rose-400" />
            )}
            <Badge tone={requiredTier === "ELITE" ? "purple" : "gold"}>
              {requiredTier}
            </Badge>
          </div>
        </div>
        
        {!meetsRequirement && (
          <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 mb-4">
            <div className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">This feature requires {requiredTier} tier</span>
            </div>
          </div>
        )}

        <div className={cn("transition-all", !meetsRequirement && "pointer-events-none opacity-50")}>
          {children}
        </div>
      </div>
    </Card>
  );
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useMyRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "ELITE":
        return <Crown className="w-4 h-4" />;
      case "PRO":
        return <Star className="w-4 h-4" />;
      default:
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "ELITE":
        return "purple";
      case "PRO":
        return "gold";
      default:
        return "blue";
    }
  };

  const connectPhantom = async () => {
    setConnecting(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if Phantom is available
      if (!window.phantom?.solana) {
        throw new Error("Phantom wallet not found. Please install Phantom extension.");
      }

      // Connect to Phantom
      const response = await window.phantom.solana.connect();
      const publicKey = response.publicKey;
      const walletAddress = publicKey.toString();

      // Set as primary wallet via RPC
      const { error: rpcError } = await supabase.rpc("set_primary_wallet", {
        p_wallet_address: walletAddress,
      });

      if (rpcError) throw rpcError;

      setSuccess("Wallet connected successfully!");
      
      // Refresh profile to get updated data
      await loadProfile();
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("tpc_tier, tpc_balance, wallet_verified_at")
        .eq("id", user.id)
        .single();

      if (!profileData) return;

      setProfile({
        id: user.id,
        tpc_tier: profileData.tpc_tier,
        tpc_balance: profileData.tpc_balance,
        wallet_verified_at: profileData.wallet_verified_at
      });

      // Load user's primary wallet
      const { data: walletData } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .single();

      setWallet(walletData);
    } catch (err: any) {
      console.error("Error loading profile:", err);
    }
  };

  const refreshVerification = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loadProfile();
      setSuccess("Profile refreshed successfully!");
    } catch (err: any) {
      setError(err?.message || "Failed to refresh profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleLoading && !role) {
      navigate("/member");
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    loadProfile();
  }, []);

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
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F0B90B]/25 bg-[#F0B90B]/10 px-4 py-2">
            <Wallet className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-semibold text-white/90">Member • Wallet</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Wallet & Tier Management
          </h1>
          <p className="mt-2 text-white/70">
            Connect your Solana wallet and view your membership tier based on TPC token holdings.
          </p>
        </div>

        {/* Notice */}
        <div className="mb-8">
          <NoticeBox
            title="Tier Calculation"
            icon={<Crown className="w-5 h-5" />}
          >
            Your tier is calculated from on-chain TPC token holdings. Higher tiers unlock exclusive features and benefits.
          </NoticeBox>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-8">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#F0B90B]" />
              <div>
                <div className="font-semibold">Connected Wallet</div>
                <div className="text-sm text-white/60">Primary Solana wallet</div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {wallet ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <div className="font-mono text-sm">{shortAddress(wallet.wallet_address)}</div>
                    <div className="text-xs text-white/60 mt-1">{wallet.wallet_address}</div>
                  </div>
                  <Badge tone="green">CONNECTED</Badge>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => window.open(`https://solscan.io/account/${wallet.wallet_address}`, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </Button>
                  <Button onClick={connectPhantom} disabled={connecting}>
                    <RefreshCw className="w-4 h-4" />
                    Reconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <div className="text-white/60 mb-4">No wallet connected</div>
                <Button onClick={connectPhantom} disabled={connecting} className="w-full md:w-auto">
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      Connect Phantom Wallet
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Tier Information */}
        {profile && (
          <Card className="mb-8">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-[#F0B90B]" />
                <div>
                  <div className="font-semibold">Current Tier</div>
                  <div className="text-sm text-white/60">Membership level & benefits</div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <Badge tone={getTierColor(profile.tpc_tier) as any} className="text-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        {getTierIcon(profile.tpc_tier)}
                        {profile.tpc_tier}
                      </div>
                    </Badge>
                  </div>
                  <div className="text-sm text-white/60">Current Tier</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F0B90B] mb-2">
                    {profile.tpc_balance.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">TPC Balance</div>
                </div>
                
                <div className="text-center">
                  <div className="mb-3">
                    {profile.wallet_verified_at ? (
                      <Badge tone="green">VERIFIED</Badge>
                    ) : (
                      <Badge tone="neutral">PENDING</Badge>
                    )}
                  </div>
                  <div className="text-sm text-white/60">Verification Status</div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={refreshVerification} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Gated Features */}
        {profile && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Premium Features</h2>
            
            <TierGate
              title="Pro Tools"
              description="Advanced analytics, priority support, and enhanced features"
              requiredTier="PRO"
              currentTier={profile.tpc_tier}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Advanced Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Priority Customer Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Exclusive Research Reports</span>
                </div>
              </div>
            </TierGate>

            <TierGate
              title="Elite Tools"
              description="VIP access, early features, and premium benefits"
              requiredTier="ELITE"
              currentTier={profile.tpc_tier}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>VIP Community Access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>Early Feature Access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>Premium API Access</span>
                </div>
              </div>
            </TierGate>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4">
            <div className="flex items-center gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
