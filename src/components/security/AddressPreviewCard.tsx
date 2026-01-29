import { useState } from "react";
import { Copy, Check, ExternalLink, Shield } from "lucide-react";
import { useI18n } from "@/i18n/i18n";
import { PAYMENT_WALLET, getSolscanUrl } from "@/config/tpcWallets";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AddressPreviewCard = () => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(PAYMENT_WALLET.address);
    setCopied(true);
    toast.success(t("common.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-premium border-glow-gold p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold text-primary">{t("verified.paymentTitle")}</span>
      </div>
      <p className="text-xs text-muted-foreground">{t("verified.paymentDesc")}</p>
      <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
        <div className="font-mono text-sm text-foreground break-all">
          {PAYMENT_WALLET.address}
        </div>
        <div className="font-mono text-xs text-primary">
          {PAYMENT_WALLET.shortAddress}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? <Check className="h-4 w-4 mr-2 text-success" /> : <Copy className="h-4 w-4 mr-2" />}
          {t("common.copy")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <a href={getSolscanUrl(PAYMENT_WALLET.address)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("common.openExplorer")}
          </a>
        </Button>
      </div>
    </div>
  );
};
