import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useProfileStatus } from "../../lib/useProfileStatus";
import { Loader2, AlertCircle, Wallet, Lock, CheckCircle } from "lucide-react";

type Props = {
  lang: any;
  children: React.ReactNode;
};

export default function ServiceAccessGate({ lang, children }: Props) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useProfileStatus();

  const tpcBalance = profile?.tpc_balance || 0;
  const hasWallet = !!profile?.wallet_address;
  const hasEnoughBalance = tpcBalance >= 1000;

  const canAccess = hasWallet && hasEnoughBalance;

  const connectPhantom = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Phantom is available
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet is not installed. Please install Phantom browser extension.");
      }

      // Connect to Phantom
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();
      
      // Update profile with wallet address
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          wallet_address: publicKey,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setWalletAddress(publicKey);
      
      // TODO: Update TPC balance when balance checking is implemented
      // For now, we'll use a stub balance
      
    } catch (err: any) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          wallet_address: null,
          tpc_balance: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setWalletAddress(null);
      
      // Disconnect from Phantom if available
      if (window.solana && window.solana.disconnect) {
        await window.solana.disconnect();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to disconnect wallet");
    }
  };

  useEffect(() => {
    setWalletAddress(profile?.wallet_address);
  }, [profile?.wallet_address]);

  // If user has access, render children
  if (canAccess) {
    return <>{children}</>;
  }

  // Show access gate UI
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#F0B90B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Services Access</h1>
          <p className="text-white/70 text-sm">
            Connect your Phantom wallet and hold minimum 1,000 TPC to access Services
          </p>
        </div>

        {/* Status Cards */}
        <div className="space-y-4 mb-6">
          {/* Wallet Connection Status */}
          <div className={`p-4 rounded-lg border ${
            hasWallet 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              {hasWallet ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">Wallet Connection</h3>
                <p className="text-sm text-white/70">
                  {hasWallet 
                    ? `Connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`
                    : 'Not connected'
                  }
                </p>
              </div>
              {hasWallet && (
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white/70"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* TPC Balance Status */}
          <div className={`p-4 rounded-lg border ${
            hasEnoughBalance 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              {hasEnoughBalance ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">TPC Balance</h3>
                <p className="text-sm text-white/70">
                  {tpcBalance.toLocaleString()} TPC {hasEnoughBalance ? '✓' : `(Need 1,000)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!hasWallet && (
          <button
            onClick={connectPhantom}
            disabled={isConnecting}
            className="w-full py-3 bg-[#F0B90B] text-black font-semibold rounded-lg hover:bg-[#F0B90B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isConnecting ? (
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
          </button>
        )}

        {hasWallet && !hasEnoughBalance && (
          <div className="text-center">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
              <Lock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-300 font-medium">Insufficient TPC Balance</p>
              <p className="text-yellow-300/70 text-sm mt-1">
                You need at least 1,000 TPC to access Services
              </p>
            </div>
            <p className="text-white/50 text-sm">
              Please acquire more TPC tokens to unlock Services
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs mb-2">
            Don't have Phantom wallet?
          </p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F0B90B] hover:text-[#F0B90B]/80 text-sm transition-colors"
          >
            Download Phantom →
          </a>
        </div>
      </div>
    </div>
  );
}

// Add TypeScript declarations for window.solana
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
    };
  }
}
