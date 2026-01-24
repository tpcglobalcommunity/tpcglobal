import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const MIN_TPC_BALANCE = 1000;

export interface WalletStatus {
  walletConnected: boolean;
  walletAddress?: string;
  tpcBalance: number;
  meetsRequirement: boolean; // >= 1000
  loading: boolean;
}

export function useWalletStatus(): WalletStatus {
  const { user } = useAuth();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    walletConnected: false,
    tpcBalance: 0,
    meetsRequirement: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchWalletStatus() {
      if (!user) {
        if (!cancelled) {
          setWalletStatus({
            walletConnected: false,
            tpcBalance: 0,
            meetsRequirement: false,
            loading: false,
          });
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('wallet_address, tpc_balance, wallet_verified_at')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (error) {
          console.error('Error fetching wallet status:', error);
          setWalletStatus({
            walletConnected: false,
            tpcBalance: 0,
            meetsRequirement: false,
            loading: false,
          });
          return;
        }

        const walletConnected = !!(profile?.wallet_address && profile?.wallet_verified_at);
        const tpcBalance = profile?.tpc_balance || 0;
        const meetsRequirement = tpcBalance >= MIN_TPC_BALANCE;

        setWalletStatus({
          walletConnected,
          walletAddress: profile?.wallet_address || undefined,
          tpcBalance,
          meetsRequirement,
          loading: false,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('Error in useWalletStatus:', err);
          setWalletStatus({
            walletConnected: false,
            tpcBalance: 0,
            meetsRequirement: false,
            loading: false,
          });
        }
      }
    }

    fetchWalletStatus();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return walletStatus;
}
