import { useState } from 'react';
import { Wallet, Check, X, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletStatus } from '@/lib/useWalletStatus';
import { PremiumCard, PremiumButton, NoticeBox } from '@/components/ui';

interface ConnectWalletCardProps {
  onWalletConnected?: () => void;
}

export function ConnectWalletCard({ onWalletConnected }: ConnectWalletCardProps) {
  const { user } = useAuth();
  const { walletConnected, walletAddress, tpcBalance, meetsRequirement, loading } = useWalletStatus();
  const [walletInput, setWalletInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    if (!user || !walletInput.trim()) {
      setError('Please enter a valid wallet address');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // MVP: Simulated wallet connection
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletInput.trim(),
          wallet_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setWalletInput('');
      onWalletConnected?.();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <PremiumCard className="p-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-white/50" />
          <div className="text-white/70">Loading wallet status...</div>
        </div>
      </PremiumCard>
    );
  }

  if (walletConnected) {
    return (
      <PremiumCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            meetsRequirement ? 'bg-green-500/20' : 'bg-yellow-500/20'
          }`}>
            {meetsRequirement ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <X className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
            <p className="text-white/70 text-sm">
              {meetsRequirement ? 'Eligible for premium services' : 'Insufficient Balance'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Address:</span>
            <span className="text-white font-mono text-sm">
              {formatAddress(walletAddress)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">TPC Balance:</span>
            <span className={`font-semibold ${
              meetsRequirement ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {tpcBalance.toLocaleString()} TPC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Status:</span>
            <span className={`text-sm font-medium ${
              meetsRequirement ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {meetsRequirement ? 'Eligible' : 'Need 1000+ TPC'}
            </span>
          </div>
        </div>

        {!meetsRequirement && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              You need at least 1,000 TPC tokens to access premium marketplace services.
            </p>
          </div>
        )}

        <div className="text-xs text-white/50 text-center mt-4">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ExternalLink className="w-3 h-3" />
            <span>MVP: Simulated wallet connection</span>
          </div>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="w-6 h-6 text-[#F0B90B]" />
        <div>
          <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
          <p className="text-white/70 text-sm">Connect your wallet to unlock premium services</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletInput}
            onChange={(e) => setWalletInput(e.target.value)}
            placeholder="Enter your wallet address (MVP: simulated)"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50"
            disabled={isConnecting}
          />
        </div>

        {error && (
          <NoticeBox variant="danger">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </NoticeBox>
        )}

        <PremiumButton
          onClick={handleConnectWallet}
          disabled={!walletInput.trim() || isConnecting}
          className="w-full"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </PremiumButton>

        <div className="text-xs text-white/50 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ExternalLink className="w-3 h-3" />
            <span>MVP: Simulated wallet connection</span>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
