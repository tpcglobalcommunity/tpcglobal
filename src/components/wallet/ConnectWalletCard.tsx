import { useState } from 'react';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumCard, PremiumButton, NoticeBox } from '@/components/ui';

interface ConnectWalletCardProps {
  onWalletConnected?: () => void;
}

export function ConnectWalletCard({ onWalletConnected }: ConnectWalletCardProps) {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    if (!user || !walletAddress.trim()) {
      setError('Please enter a valid wallet address');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Simulated wallet connection for MVP
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress.trim(),
          wallet_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setWalletAddress('');
      onWalletConnected?.();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Wallet className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Connect Wallet</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter your wallet address (MVP: simulated)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          disabled={!walletAddress.trim() || isConnecting}
          className="w-full"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </PremiumButton>

        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3" />
            <span>MVP: Simulated wallet connection</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" />
            <span>Real wallet integration coming soon</span>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
