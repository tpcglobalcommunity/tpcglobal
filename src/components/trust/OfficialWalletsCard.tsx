import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { ALL_WALLETS, PAYMENT_WALLET, TRANSPARENCY_WALLETS, getSolscanUrl, TPCWallet } from "@/config/tpcWallets";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletItemProps {
  wallet: TPCWallet;
  showFull?: boolean;
}

const WalletItem = ({ wallet, showFull = false }: WalletItemProps) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    toast.success(t("common.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-premium p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary">{t(wallet.labelKey)}</span>
            {wallet.type === "payment" && (
              <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded">
                {t(wallet.purposeKey)}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-2">{t(wallet.purposeKey)}</p>
          <div className="font-mono text-sm break-all text-foreground/90">
            {showFull ? wallet.address : wallet.shortAddress}
          </div>
          {!showFull && (
            <div className="font-mono text-xs text-muted-foreground mt-1 break-all">
              {wallet.address}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 w-8 p-0"
          >
            <a href={getSolscanUrl(wallet.address)} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface OfficialWalletsCardProps {
  showPayment?: boolean;
  showTransparency?: boolean;
  compact?: boolean;
}

export const OfficialWalletsCard = ({
  showPayment = true,
  showTransparency = true,
  compact = false,
}: OfficialWalletsCardProps) => {
  const { t } = useI18n();

  const walletsToShow = showPayment && showTransparency
    ? ALL_WALLETS
    : showPayment
    ? [PAYMENT_WALLET]
    : TRANSPARENCY_WALLETS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gradient-gold">
          {t("wallets.officialWallets")}
        </h3>
        <span className="text-xs text-muted-foreground">
          {t("wallets.verifyBefore")}
        </span>
      </div>
      <div className={compact ? "space-y-2" : "grid gap-3"}>
        {walletsToShow.map((wallet) => (
          <WalletItem key={wallet.address} wallet={wallet} showFull={!compact} />
        ))}
      </div>
    </div>
  );
};
