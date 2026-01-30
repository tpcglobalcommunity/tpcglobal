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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  AlertCircle, 
  Calculator
} from "lucide-react";
import { 
  getPresaleStagesPublic, 
  getPaymentMethodsPublic, 
  createInvoicePublic,
  type PresaleStage,
  type PaymentMethod,
  type CreateInvoiceRequest
} from "@/lib/rpc/public";
import { supabase } from "@/integrations/supabase/client";

const BuyTpcPage = () => {
  const { t, lang, withLang } = useI18n();
  const navigate = useNavigate();
  
  const [stages, setStages] = useState<PresaleStage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("stage1");
  const [tpcAmount, setTpcAmount] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // Default USD/IDR rate with fallback
  const DEFAULT_USD_IDR_RATE = 17000;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stagesData, paymentMethodsData] = await Promise.all([
          getPresaleStagesPublic(),
          getPaymentMethodsPublic()
        ]);
        setStages(stagesData);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        logger.info('Failed to load presale data', { error });
        setStages([]);
        setPaymentMethods([]);
      }
    };
    loadData();
  }, []);

  const currentStage = stages.find(s => s.stage === selectedStage);
  
  // SAFE numeric helpers
  const toNum = (v: unknown, fallback = 0) => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  
  const safeFixed = (v: unknown, digits = 2) => toNum(v, 0).toFixed(digits);
  
  const formatUsd = (v: unknown) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toNum(v, 0));
  
  const formatIdr = (v: unknown) =>
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(toNum(v, 0));
  
  // SAFE calculations with guards
  const tpcAmountNum = toNum(tpcAmount, 0);
  const priceUsd = toNum(currentStage?.price_usd, 0);
  const usdIdrRate = DEFAULT_USD_IDR_RATE;
  
  const totalUsd = tpcAmountNum * priceUsd;
  const totalIdr = totalUsd * usdIdrRate;
  
  const calculatedUsd = safeFixed(totalUsd, 2);
  const calculatedIdr = formatIdr(totalIdr);

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPayment(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    setSelectedPaymentMethod(method || null);
  };

  const handleCreateInvoice = async () => {
    if (!tpcAmount || !selectedPayment || !buyerEmail || !termsAccepted) {
      toast.error("Please fill all required fields and accept terms");
      return;
    }

    if (!currentStage || currentStage.status !== 'ACTIVE') {
      toast.error("Selected stage is not active");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('create_invoice', {
        p_tpc_amount: toNum(tpcAmount, 0),
        p_referral_code: null
      });

      if (error) {
        logger.error('Failed to create invoice', { error });
        toast.error("Failed to create invoice");
        return;
      }

      const invoiceNo = Array.isArray(data) ? data[0]?.invoice_no : data?.invoice_no || data;
      
      toast.success("Invoice created successfully!");
      navigate(withLang(`/invoice/${invoiceNo}`));
    } catch (error) {
      logger.error('Failed to create invoice', { error });
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation checks
  const isValidAmount = tpcAmountNum > 0 && priceUsd > 0 && totalUsd > 0;
  const canBuy = currentStage?.status === 'ACTIVE' && 
               isValidAmount && 
               selectedPayment && 
               buyerEmail && 
               termsAccepted &&
               !isSubmitting;

  return (
    <div className="container-app section-spacing">
      <div className="text-center mb-8">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">{t("buyTpc.title")}</h1>
        <p className="text-muted-foreground">{t("buyTpc.subtitle")}</p>
      </div>

      {/* Trust Header */}
      <Card className="card-premium mb-6 bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-amber-500/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-amber-400 mb-3">
              {t("buyTpc.trustHeader.headline")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("buyTpc.trustHeader.subheadline")}
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{t("buyTpc.trustHeader.bullets.treasury")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2a1 1 0 100-2 2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{t("buyTpc.trustHeader.bullets.invoice")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <span>{t("buyTpc.trustHeader.bullets.education")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Scam Box */}
      <Card className="card-premium mb-6 border-amber-500 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-400 mb-3">
                {t("buyTpc.antiScam.title")}
              </h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {(() => {
                  const points = t("buyTpc.antiScam.points");
                  if (Array.isArray(points)) {
                    return points.map((point, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0"></div>
                        <span>{point}</span>
                      </div>
                    ));
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Form */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("buyTpc.purchase.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!currentStage || currentStage.status !== 'ACTIVE' ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select an active stage to continue with purchase.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tpc-amount">{t("buyTpc.purchase.tpcAmount")}</Label>
                <Input
                  id="tpc-amount"
                  type="number"
                  placeholder="Enter TPC amount"
                  value={tpcAmount}
                  onChange={(e) => setTpcAmount(e.target.value)}
                  min="1"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t("buyTpc.purchase.tpcAmount")}:</span>
                    <span>{tpcAmount || "0"} TPC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total USD:</span>
                    <span>${calculatedUsd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total IDR:</span>
                    <span>{calculatedIdr}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="buyer-email">Email</Label>
                <Input
                  id="buyer-email"
                  type="email"
                  placeholder="your@email.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>{t("buyTpc.purchase.paymentMethod")}</Label>
                <Select value={selectedPayment} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("buyTpc.purchase.selectPayment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {t(`buyTpc.paymentMethods.${method.type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPaymentMethod && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 text-sm font-medium">Destination Address</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedPaymentMethod.address || "");
                        toast.success("Address copied to clipboard!");
                      }}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white transition-all duration-200"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-black/30 rounded p-3 font-mono text-xs text-gray-300 break-all">
                    {selectedPaymentMethod.address}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legal-consent"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="legal-consent" className="text-sm">
                  {t("buyTpc.agreeTerms")}
                </Label>
              </div>

              <Button 
                onClick={handleCreateInvoice}
                disabled={!canBuy}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating invoice...
                  </div>
                ) : (
                  t("buyTpc.createInvoiceButton")
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* What Happens After Payment */}
      <Card className="card-premium mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {t("buyTpc.afterPayment.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const steps = t("buyTpc.afterPayment.steps");
              if (Array.isArray(steps)) {
                return steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ));
              }
              return null;
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="text-lg">
            {lang === 'en' ? 'Legal Information' : 'Informasi Legal'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b border-border">
              <div className="flex space-x-8">
                <button className="pb-2 text-sm font-medium text-primary border-b-2 border-primary">
                  {t("buyTpc.legal.termsTab")}
                </button>
                <button className="pb-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {t("buyTpc.legal.riskTab")}
                </button>
                <button className="pb-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  {t("buyTpc.legal.educationTab")}
                </button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {lang === 'en' 
                ? 'By proceeding with this purchase, you acknowledge that you have read, understood, and agree to the Terms of Purchase, Risk Disclosure, and Education Disclaimer.'
                : 'Dengan melanjutkan pembelian ini, Anda mengakui bahwa telah membaca, memahami, dan menyetujui Terms of Purchase, Risk Disclosure, dan Education Disclaimer.'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyTpcPage;
