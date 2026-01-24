import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NoticeBox, PremiumButton, PremiumCard, PremiumSection } from "@/components/ui";
import { TierBadge } from "@/components/ui/TierBadge";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
    };
  }
}

function shortAddr(a: string) {
  if (!a) return "";
  return a.slice(0, 4) + "…" + a.slice(-4);
}

export default function WalletPage() {
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [tier, setTier] = useState<string>("BASIC");
  const [balance, setBalance] = useState<number>(0);
  const [walletVerifiedAt, setWalletVerifiedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  const phantomInstalled = !!window.solana?.isPhantom;

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("tpc_tier,tpc_balance,wallet_verified_at")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setTier(data.tpc_tier ?? "BASIC");
      setBalance(Number(data.tpc_balance ?? 0));
      setWalletVerifiedAt(data.wallet_verified_at);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function connectAndLink() {
    try {
      setNotice(null);
      if (!phantomInstalled) {
        setNotice({ type: "error", msg: "Phantom belum terpasang. Install Phantom dulu." });
        return;
      }

      setLoading(true);
      const resp = await window.solana!.connect(); // opens Phantom popup
      const address = resp?.publicKey?.toString();
      if (!address) throw new Error("Gagal mendapatkan alamat wallet");

      setWallet(address);

      const { error } = await supabase.rpc("set_primary_wallet", { p_wallet_address: address });
      if (error) throw error;

      setNotice({ type: "success", msg: `Wallet tersambung: ${shortAddr(address)}. Tier akan terupdate otomatis.` });
      await loadProfile();
    } catch (e: any) {
      setNotice({ type: "error", msg: e?.message ?? "Gagal connect wallet" });
    } finally {
      setLoading(false);
    }
  }

  async function refreshTier() {
    setNotice({ type: "info", msg: "Refresh data... (tier akan berubah setelah worker jalan)" });
    await loadProfile();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setNotice({ type: "success", msg: "Wallet address copied!" });
  }

  return (
    <PremiumSection title="Wallet & Tier" subtitle="Hubungkan wallet Solana untuk menghitung tier dari holding TPC (on-chain).">
      {notice && (
        <NoticeBox variant={notice.type === "error" ? "danger" : notice.type === "success" ? "success" : "info"}>
          {notice.msg}
        </NoticeBox>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <PremiumCard>
          <div className="space-y-2">
            <div className="text-sm text-white/70">Connected Wallet</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{wallet ? shortAddr(wallet) : "Not connected"}</div>
              {wallet && (
                <button
                  onClick={() => copyToClipboard(wallet)}
                  className="text-[#F0B90B] hover:text-[#F0B90B]/80 text-sm"
                  title="Copy wallet address"
                >
                  📋
                </button>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <PremiumButton onClick={connectAndLink} disabled={loading}>
                {loading ? "Connecting..." : phantomInstalled ? "Connect Phantom" : "Install Phantom"}
              </PremiumButton>
              <PremiumButton variant="secondary" onClick={refreshTier} disabled={loading}>
                Refresh Tier
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="space-y-2">
            <div className="text-sm text-white/70">Current Tier</div>
            <div className="flex items-center gap-2">
              <TierBadge tier={tier} />
            </div>
            <div className="text-sm text-white/70">TPC Balance (cached)</div>
            <div className="text-lg font-semibold">{balance.toLocaleString()}</div>
            <div className="text-sm text-white/70">Wallet Verified</div>
            <div className="text-sm">
              {walletVerifiedAt ? (
                <span className="text-green-400">
                  ✓ {new Date(walletVerifiedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-yellow-400">
                  ⏳ Pending verification
                </span>
              )}
            </div>
            <div className="text-xs text-white/60 pt-2">
              Tier dihitung dari holding TPC on-chain dan di-cache di database untuk performa.
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumSection>
  );
}
