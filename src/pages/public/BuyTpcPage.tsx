import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  AlertCircle, 
  Calculator,
  Shield,
  Building,
  BookOpen,
  Copy,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePresaleSettings } from "@/hooks/usePresaleSettings";

const BuyTpcPage = () => {
  const { t, lang, withLang } = useI18n();
  const navigate = useNavigate();
  const { settings, loading, error } = usePresaleSettings();
  
  // Form state
  const [email, setEmail] = useState<string>("");
  const [tpcAmount, setTpcAmount] = useState<string>("");
  const [referralCode, setReferralCode] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  // Constants
  const MAX_TPC_AMOUNT = 100000000; // 100M TPC max per invoice

  // Calculate estimates based on server settings
  const getEstimates = () => {
    if (!settings || !tpcAmount) {
      return { usd: "0.00", idr: "0" };
    }

    const amount = parseFloat(tpcAmount) || 0;
    if (amount <= 0) {
      return { usd: "0.00", idr: "0" };
    }

    const priceUsd = settings.active_stage === 'stage1' ? settings.stage1_price_usd : settings.stage2_price_usd;
    const totalUsd = amount * priceUsd;
    const totalIdr = totalUsd * settings.usd_idr_rate;

    return {
      usd: totalUsd.toFixed(2),
      idr: Math.round(totalIdr).toLocaleString('id-ID')
    };
  };

  const estimates = getEstimates();

  // Validation
  const validateForm = (): string | null => {
    if (!email || !email.includes('@')) {
      const msg = t("buyTpc.validation.invalidEmail");
      return typeof msg === 'string' ? msg : String(msg);
    }
    
    const amount = parseFloat(tpcAmount);
    if (!amount || amount <= 0) {
      const msg = t("buyTpc.validation.invalidAmount");
      return typeof msg === 'string' ? msg : String(msg);
    }
    
    if (amount > MAX_TPC_AMOUNT) {
      return lang === 'id' 
        ? `Jumlah terlalu besar. Maksimum ${MAX_TPC_AMOUNT.toLocaleString('id-ID')} TPC per invoice`
        : `Amount too large. Maximum ${MAX_TPC_AMOUNT.toLocaleString()} TPC per invoice`;
    }
    
    if (!termsAccepted) {
      const msg = t("buyTpc.validation.mustAcceptTerms");
      return typeof msg === 'string' ? msg : String(msg);
    }
    
    return null;
  };

  const handleCreateInvoice = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('create_invoice', {
        p_tpc_amount: parseFloat(tpcAmount),
        p_referral_code: referralCode.trim() ? referralCode.trim() : null
      });

      if (error) {
        logger.error('Failed to create invoice', { error });
        toast.error(t("buyTpc.toast.invoiceFailed"));
        return;
      }

      const invoiceResult = Array.isArray(data) && data.length > 0 ? data[0] : null;
      
      if (!invoiceResult) {
        toast.error(t("buyTpc.toast.invoiceFailed"));
        return;
      }

      // Prepare invoice data for modal using RPC response
      setInvoiceData({
        invoice_no: invoiceResult.invoice_no,
        stage: invoiceResult.stage,
        tpc_amount: invoiceResult.tpc_amount,
        total_usd: invoiceResult.total_usd,
        total_idr: invoiceResult.total_idr,
        treasury_address: invoiceResult.treasury_address,
        expires_at: invoiceResult.expires_at
      });

      setShowInvoiceModal(true);
      toast.success(t("buyTpc.toast.invoiceCreated"));
      
    } catch (error) {
      logger.error('Unexpected error creating invoice', error);
      toast.error(t("buyTpc.toast.invoiceFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(lang === 'id' ? 'Disalin!' : 'Copied!');
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
    }
  };

  const openInvoiceDetail = () => {
    if (invoiceData?.invoice_no) {
      navigate(withLang(`/invoice/${invoiceData.invoice_no}`));
      setShowInvoiceModal(false);
    }
  };

  const isFormValid = email && tpcAmount && termsAccepted && !isSubmitting && !loading;

  return (
    <div className="container-app section-spacing">
      {/* Trust Header */}
      <div className="text-center mb-8">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">{t("buyTpc.title")}</h1>
        <p className="text-muted-foreground">{t("buyTpc.subtitle")}</p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpc.trust.b1")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpc.trust.b2")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpc.trust.b3")}</span>
          </div>
        </div>
      </div>

      {/* Stage Info */}
      {loading ? (
        <Card className="card-premium mb-6">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lang === 'id' ? 'Informasi stage sedang tidak tersedia' : 'Stage information is temporarily unavailable'}
          </AlertDescription>
        </Alert>
      ) : settings ? (
        <Card className="card-premium mb-6">
          <CardHeader>
            <CardTitle>{lang === 'id' ? 'Informasi Stage' : 'Stage Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Stage Aktif' : 'Active Stage'}</p>
                <p className="font-semibold">{settings.active_stage.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Harga' : 'Price'}</p>
                <p className="font-semibold">
                  ${settings.active_stage === 'stage1' ? settings.stage1_price_usd : settings.stage2_price_usd} / TPC
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Kurs USD/IDR' : 'USD/IDR Rate'}</p>
                <p className="font-semibold">{settings.usd_idr_rate.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{lang === 'id' ? 'Status' : 'Status'}</p>
                <p className="font-semibold text-green-400">{lang === 'id' ? 'Tersedia' : 'Available'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Buy Form */}
      <Card className="card-premium mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("buyTpc.form.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{t("buyTpc.form.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="amount">{t("buyTpc.form.amount")}</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={tpcAmount}
                onChange={(e) => setTpcAmount(e.target.value)}
                min="1"
                max={MAX_TPC_AMOUNT}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referral">{t("buyTpc.form.referral")}</Label>
              <Input
                id="referral"
                placeholder="REF123 (optional)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm">
              {t("buyTpc.form.termsLabel")}
            </Label>
          </div>

          <Button 
            onClick={handleCreateInvoice}
            disabled={!isFormValid}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {lang === 'id' ? 'Membuat Invoice...' : 'Creating Invoice...'}
              </div>
            ) : (
              t("buyTpc.cta.createInvoice")
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="card-premium mb-6">
        <CardHeader>
          <CardTitle>{t("buyTpc.summary.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{t("buyTpc.summary.totalUsd")}:</span>
              <span className="font-semibold">${estimates.usd}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("buyTpc.summary.totalIdr")}:</span>
              <span className="font-semibold">Rp {estimates.idr}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("buyTpc.summary.rate")}:</span>
              <span className="font-semibold">{settings?.usd_idr_rate.toLocaleString('id-ID') || '17,000'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination Address */}
      {settings?.treasury_address && (
        <Card className="card-premium mb-6">
          <CardHeader>
            <CardTitle>{t("buyTpc.destination.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-mono">{settings.treasury_address}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(settings.treasury_address)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t("buyTpc.destination.copy")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What Happens Next */}
      <Card className="card-premium mb-6">
        <CardHeader>
          <CardTitle>{t("buyTpc.next.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{step}</span>
                </div>
                <span className="text-sm">{t(`buyTpc.next.s${step}`)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <a href={withLang("/terms")} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("buyTpc.terms")}
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={withLang("/risk")} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("buyTpc.risk")}
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={withLang("/disclaimer")} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("buyTpc.disclaimer")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("buyTpc.modal.title")}</DialogTitle>
          </DialogHeader>
          {invoiceData && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{lang === 'id' ? 'No. Invoice' : 'Invoice No'}:</span>
                    <span className="font-mono font-semibold">{invoiceData.invoice_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'id' ? 'Stage' : 'Stage'}:</span>
                    <span>{invoiceData.stage.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpc.form.amount")}:</span>
                    <span>{invoiceData.tpc_amount.toLocaleString('id-ID')} TPC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpc.summary.totalUsd")}:</span>
                    <span>${invoiceData.total_usd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpc.summary.totalIdr")}:</span>
                    <span>Rp {invoiceData.total_idr}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={openInvoiceDetail}
                  className="w-full"
                >
                  {t("buyTpc.modal.openInvoice")}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => copyToClipboard(invoiceData.treasury_address)}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t("buyTpc.modal.copyAddress")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuyTpcPage;
