import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { AlertTriangle, Check, Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRIMARY_SITE_URL } from "@/config/site";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const STORAGE_KEY = "tpc_buy_anti_scam_ack_v1";

interface BuyAntiScamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
}

export const BuyAntiScamModal = ({ open, onOpenChange, onContinue }: BuyAntiScamModalProps) => {
  const { t, withLang } = useI18n();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopyDomain = async () => {
    await navigator.clipboard.writeText("tpcglobal.io");
    toast.success(t("common.copied"));
  };

  const handleContinue = () => {
    if (acknowledged) {
      localStorage.setItem(STORAGE_KEY, "true");
      onContinue();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            {t("antiScam.modalTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("antiScam.modalDesc")}
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>{t("antiScam.modalWarning1")}</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>{t("antiScam.modalWarning2")}</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>{t("antiScam.modalWarning3")}</span>
            </li>
          </ul>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
            <Checkbox
              id="ack"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <label htmlFor="ack" className="text-sm cursor-pointer">
              {t("antiScam.modalCheckbox")}
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleContinue}
              disabled={!acknowledged}
              className="w-full btn-gold-glow"
            >
              <Check className="h-4 w-4 mr-2" />
              {t("antiScam.modalContinue")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link to={withLang("/verified")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("antiScam.modalVerify")}
                </Link>
              </Button>
              <Button variant="outline" onClick={handleCopyDomain}>
                <Copy className="h-4 w-4 mr-2" />
                {t("antiScam.modalCopyDomain")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to check if user has already acknowledged
export const useAntiScamAck = () => {
  const [hasAcked, setHasAcked] = useState(false);

  useEffect(() => {
    const acked = localStorage.getItem(STORAGE_KEY);
    setHasAcked(acked === "true");
  }, []);

  return hasAcked;
};
