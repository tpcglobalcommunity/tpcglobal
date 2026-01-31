import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  AlertCircle, 
  Calculator,
  Shield,
  Building,
  BookOpen,
  Copy,
  ExternalLink,
  FileText
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

  // Auto-fill referral code from URL or default to TPC000001
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRef = urlParams.get('ref');
    if (urlRef && urlRef.trim()) {
      setReferralCode(urlRef.trim());
    } else {
      setReferralCode('TPC000001'); // Default to Super Admin code
    }
  }, []);

  // Calculate estimates based on server settings
  const getEstimates = () => {
    if (!settings || !tpcAmount) {
      return { usd: "0.00", idr: "0", pricePerTpc: "0.001" };
    }

    const amount = parseFloat(tpcAmount) || 0;
    if (amount <= 0) {
      return { usd: "0.00", idr: "0", pricePerTpc: "0.001" };
    }

    const priceUsd = settings.active_stage === 'stage1' ? settings.stage1_price_usd : settings.stage2_price_usd;
    const totalUsd = amount * priceUsd;
    const totalIdr = totalUsd * settings.usd_idr_rate;

    return {
      usd: totalUsd.toFixed(2),
      idr: Math.round(totalIdr).toLocaleString('id-ID'),
      pricePerTpc: priceUsd.toFixed(3)
    };
  };

  const estimates = getEstimates();

  // Validation
  const validateForm = (): string | null => {
    if (!email || !email.includes('@')) {
      const msg = t("buyTpcNew.form.email.error");
      return typeof msg === 'string' ? msg : String(msg);
    }
    
    const amount = parseFloat(tpcAmount);
    if (!amount || amount <= 0) {
      const msg = t("buyTpcNew.form.amount.error");
      return typeof msg === 'string' ? msg : String(msg);
    }
    
    if (amount > MAX_TPC_AMOUNT) {
      return lang === 'id' 
        ? `Jumlah terlalu besar. Maksimum ${MAX_TPC_AMOUNT.toLocaleString('id-ID')} TPC per invoice`
        : `Amount too large. Maximum ${MAX_TPC_AMOUNT.toLocaleString()} TPC per invoice`;
    }
    
    if (!termsAccepted) {
      const msg = t("buyTpcNew.form.terms.error");
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
        p_email: email,
        p_tpc_amount: parseFloat(tpcAmount),
        p_referral_code: referralCode.trim() || null
      });

      if (error) {
        logger.error('Failed to create invoice', { 
          message: error.message, 
          details: error.details, 
          hint: error.hint, 
          code: error.code 
        });
        toast.error(t("buyTpcNew.toast.invoiceFailed"));
        return;
      }

      // Handle both array and object return types from Supabase RPC
      const invoiceResult = Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
      
      if (!invoiceResult?.invoice_no) {
        logger.error('create_invoice returned unexpected shape', { data });
        toast.error(String(t("buyTpcNew.toast.invoiceFailed")));
        return;
      }

      // Prepare invoice data for modal using RPC response
      setInvoiceData({
        invoice_no: invoiceResult.invoice_no,
        stage: invoiceResult.stage,
        tpc_amount: Number(invoiceResult.tpc_amount) || 0,
        total_usd: Number(invoiceResult.total_usd) || 0,
        total_idr: Number(invoiceResult.total_idr) || 0,
        treasury_address: invoiceResult.treasury_address,
        expires_at: invoiceResult.expires_at
      });

      // Debug log before opening modal
      logger.info("Opening invoice modal", { invoice_no: invoiceResult.invoice_no });

      setShowInvoiceModal(true);
      toast.success(t("buyTpcNew.toast.invoiceCreated"));
      
      // Send invoice email
      try {
        const { getEmailService } = await import('@/lib/emailService');
        const emailService = getEmailService();
        await emailService.sendInvoiceEmail(email, invoiceResult.invoice_no, lang);
        logger.info('Invoice email sent successfully', { email, invoice_no: invoiceResult.invoice_no });
      } catch (emailError) {
        logger.error('Failed to send invoice email', { error: emailError, email, invoice_no: invoiceResult.invoice_no });
        // Don't show error to user since invoice was created successfully
      }
      
    } catch (error) {
      logger.error('Unexpected error creating invoice', error);
      toast.error(t("buyTpcNew.toast.invoiceFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("buyTpcNew.summary.copy"));
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

  const isFormValid = email && tpcAmount && referralCode && termsAccepted && !isSubmitting && !loading;

  return (
    <div className="container-app section-spacing">
      {/* Trust Header */}
      <div className="text-center mb-8">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">{t("buyTpcNew.title")}</h1>
        <p className="text-muted-foreground">{t("buyTpcNew.subtitle")}</p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpcNew.trust.b1")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpcNew.trust.b2")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{t("buyTpcNew.trust.b3")}</span>
          </div>
        </div>
      </div>

      {/* Buy Form */}
      <Card className="card-premium mb-6 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("buyTpcNew.form.title")}
          </CardTitle>
          <CardDescription>{t("buyTpcNew.form.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{t("buyTpcNew.form.email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={String(t("buyTpcNew.form.email.placeholder"))}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">{String(t("buyTpcNew.form.amount.label"))}</Label>
              <Input
                id="amount"
                type="number"
                placeholder={String(t("buyTpcNew.form.amount.placeholder"))}
                value={tpcAmount}
                onChange={(e) => setTpcAmount(e.target.value)}
                min="1"
                max={MAX_TPC_AMOUNT}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="referral">{String(t("buyTpcNew.form.ref.label"))}</Label>
              <Input
                id="referral"
                placeholder={String(t("buyTpcNew.form.ref.placeholder"))}
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              {t("buyTpcNew.form.terms.label")}
            </Label>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">{t("buyTpcNew.summary.title")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t("buyTpcNew.summary.pricePerTpc")}:</span>
                <span className="font-semibold">${estimates.pricePerTpc}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("buyTpcNew.summary.totalUsd")}:</span>
                <span className="font-semibold">${estimates.usd}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("buyTpcNew.summary.totalIdr")}:</span>
                <span className="font-semibold">Rp {estimates.idr}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("buyTpcNew.summary.rate")}:</span>
                <span className="font-semibold">{settings?.usd_idr_rate.toLocaleString('id-ID') || '17,000'}</span>
              </div>
              {settings?.treasury_address && (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-muted-foreground">{t("buyTpcNew.summary.treasury")}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                        {settings.treasury_address}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(settings.treasury_address)}
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Button 
            onClick={handleCreateInvoice}
            disabled={!isFormValid}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {t("buyTpcNew.cta.creating")}
              </div>
            ) : (
              t("buyTpcNew.cta.create")
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mini FAQ */}
      <Card className="card-premium max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("buyTpcNew.faq.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-y-2">
                <h4 className="font-medium text-sm">{t(`buyTpcNew.faq.q${item}`)}</h4>
                <p className="text-sm text-muted-foreground">{t(`buyTpcNew.faq.a${item}`)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("buyTpcNew.modal.title")}</DialogTitle>
            <DialogDescription>{t("buyTpcNew.modal.desc")}</DialogDescription>
          </DialogHeader>
          {invoiceData && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t("buyTpcNew.modal.invoiceNo")}:</span>
                    <span className="font-mono font-semibold">{invoiceData.invoice_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpcNew.modal.status")}:</span>
                    <span className="text-yellow-600 font-medium">UNPAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpcNew.form.amount.label")}:</span>
                    <span>{invoiceData.tpc_amount.toLocaleString('id-ID')} TPC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpcNew.summary.totalUsd")}:</span>
                    <span>${invoiceData.total_usd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("buyTpcNew.summary.totalIdr")}:</span>
                    <span>Rp {invoiceData.total_idr}</span>
                  </div>
                  {(() => {
                    const exp = invoiceData.expires_at ? new Date(invoiceData.expires_at) : null;
                    return exp && !isNaN(exp.getTime()) ? (
                      <div className="flex justify-between">
                        <span>{t("buyTpcNew.modal.expires")}:</span>
                        <span>{exp.toLocaleDateString()}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={openInvoiceDetail}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t("buyTpcNew.modal.viewInvoice")}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-full"
                >
                  {t("buyTpcNew.modal.close")}
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
