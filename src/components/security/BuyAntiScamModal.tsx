import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AlertTriangle, ExternalLink, Copy } from 'lucide-react';
import { PRIMARY_SITE_URL } from '../../config/site';

const ANTI_SCAM_ACK_KEY = 'tpc_buy_anti_scam_ack_v1';

interface BuyAntiScamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function BuyAntiScamModal({ isOpen, onClose, onContinue }: BuyAntiScamModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasAcknowledged = localStorage.getItem(ANTI_SCAM_ACK_KEY) === 'true';
    if (hasAcknowledged) {
      setAcknowledged(true);
    }
  }, []);

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText('tpcglobal.io');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy domain:', err);
    }
  };

  const handleContinue = () => {
    localStorage.setItem(ANTI_SCAM_ACK_KEY, 'true');
    onContinue();
  };

  const handleOpenVerified = () => {
    window.open(`${PRIMARY_SITE_URL}/verified`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Anti-Scam Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning" title="Important Security Notice">
            <AlertTriangle className="h-4 w-4" />
            Before proceeding, please acknowledge that you understand the security measures.
          </Alert>

          <div className="space-y-3">
            <h4 className="font-semibold text-white">Security Checklist:</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Only use official wallets listed on the /verified page</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Always verify the domain: tpcglobal.io</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Never share your private keys or seed phrases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Double-check wallet addresses before sending funds</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 p-3 bg-surface rounded-lg">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 text-gold bg-surface border-border rounded focus:ring-gold"
            />
            <label htmlFor="acknowledge" className="text-sm text-white">
              I understand and acknowledge these security measures
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleOpenVerified}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Verified
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyDomain}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Domain'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              onClick={handleContinue}
              disabled={!acknowledged}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
