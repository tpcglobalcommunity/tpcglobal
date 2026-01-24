// src/components/guards/ServiceAccessGate.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useProfileStatus } from "@/lib/useProfileStatus";
import { Loader2, AlertCircle, Wallet, Lock, CheckCircle } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function ServiceAccessGate({ children }: Props) {
  const { role, verified, loading } = useProfileStatus();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, use placeholder values until we have full profile data
  const tpcBalance = 0;
  const hasWalletSaved = false;
  const hasEnoughBalance = false;

  // Sync UI wallet state from profile when loaded
  useEffect(() => {
    // Profile data not available in new useProfileStatus hook
    // TODO: Implement full profile fetching if needed
  }, []);

  const connectPhantom = async () => {
    setError(null);

    try {
      setIsConnecting(true);

      // Phantom provider
      const provider = (window as any)?.solana;
      if (!provider?.isPhantom) {
        setError("Phantom Wallet tidak terdeteksi. Silakan install Phantom.");
        return;
      }

      const res = await provider.connect();
      const addr = res?.publicKey?.toString?.();
      if (!addr) {
        setError("Gagal membaca alamat wallet.");
        return;
      }

      setWalletAddress(addr);

      // Save to profiles (must match your column name: wallet_address)
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ wallet_address: addr, updated_at: new Date().toISOString() })
        .eq("id", profile?.id);

      if (upErr) throw upErr;
    } catch (e: any) {
      setError(e?.message ? String(e.message) : "Gagal konek ke wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white/70 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat akses layanan...
      </div>
    );
  }

  // Jika belum punya profile (harusnya jarang)
  if (!profile) {
    return (
      <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-white">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <div className="font-semibold">Profil belum tersedia</div>
            <div className="text-sm text-white/70 mt-1">
              Silakan login ulang, atau lengkapi profil dulu.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gate 1: wallet wajib
  const walletOk = hasWalletSaved || !!walletAddress;

  // Gate 2: balance wajib
  const canAccess = walletOk && hasEnoughBalance;

  if (canAccess) return <>{children}</>;

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-white">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#F0B90B] mt-0.5" />
        <div className="flex-1">
          <div className="text-lg font-semibold">Akses Layanan Terkunci</div>
          <div className="text-sm text-white/70 mt-1">
            Untuk membuka layanan, kita butuh wallet terhubung dan saldo TPC minimal 1000.
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              {walletOk ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Wallet className="w-4 h-4 text-white/60" />
              )}
              <span>
                Wallet:{" "}
                {walletOk ? (
                  <span className="text-green-300">Terhubung</span>
                ) : (
                  <span className="text-red-300">Belum terhubung</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {hasEnoughBalance ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>
                Saldo TPC:{" "}
                <b className={hasEnoughBalance ? "text-green-300" : "text-red-300"}>
                  {tpcBalance}
                </b>{" "}
                / 1000
              </span>
            </div>

            {!walletOk && (
              <button
                onClick={connectPhantom}
                disabled={isConnecting}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0B90B] text-black font-semibold disabled:opacity-60"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menghubungkan...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" /> Hubungkan Phantom
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/15 border border-red-500/25 text-red-200 text-sm">
                {error}
              </div>
            )}

            {!hasEnoughBalance && (
              <div className="mt-3 text-xs text-white/60">
                Catatan: saldo <b>tpc_balance</b> dibaca dari tabel <b>profiles</b>. Pastikan proses update saldo sudah ada
                (manual / sync on-chain / admin).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Phantom typing
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString(): string } }>;
      disconnect: () => Promise<void>;
    };
  }
}
