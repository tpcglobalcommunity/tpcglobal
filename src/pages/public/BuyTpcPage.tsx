import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { legalContent } from "@/content/legal-simple";
import { toast } from "sonner";
import { 
  ShoppingCart, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
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
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BuyTpcPage = () => {
  const { t, lang, withLang } = useI18n();
  const navigate = useNavigate();
  
  // SAFE translation helper to prevent raw key leakage
  const safeT = (key: string, defaultValue?: string) => {
    const translation = t(key);
    // If translation equals the key, it means the key wasn't found
    if (translation === key && defaultValue) {
      return defaultValue;
    }
    return translation;
  };
  
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
  
  const [stages, setStages] = useState<PresaleStage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>("stage1");
  const [tpcAmount, setTpcAmount] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [buyerEmail, setBuyerEmail] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [legalConsent, setLegalConsent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState<'terms' | 'risk' | 'disclaimer'>('terms');
  
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
        // Don't show error toast for public browsing - just use empty state
        setStages([]);
        setPaymentMethods([]);
      }
    };
    loadData();
  }, []);

  const currentStage = stages.find(s => s.stage === selectedStage);
  
  // SAFE calculations with guards
  const tpcAmountNum = toNum(tpcAmount, 0);
  const priceUsd = toNum(currentStage?.price_usd, 0);
  const usdIdrRate = DEFAULT_USD_IDR_RATE; // Fixed fallback rate
  
  const totalUsd = tpcAmountNum * priceUsd;
  const totalIdr = totalUsd * usdIdrRate;
  
  const calculatedUsd = safeFixed(totalUsd, 2);
  const calculatedIdr = formatIdr(totalIdr);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'SOLD_OUT': return 'bg-red-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'UPCOMING': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    
    if (months > 0) {
      return `${months}m ${remainingDays}d`;
    }
    return `${days}d`;
  };

  const handlePaymentMethodChange = (methodId: string) => {
    setSelectedPayment(methodId);
    const method = paymentMethods.find(m => m.id === methodId);
    setSelectedPaymentMethod(method || null);
  };

  const handleCreateInvoice = async () => {
    if (!tpcAmount || !selectedPayment || !buyerEmail || !termsAccepted) {
      toast.error(t("buyTpc.purchase.termsRequired"));
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
        toast.error(t("buyTpc.invoiceCreationFailed"));
        return;
      }

      const invoiceNo = data?.[0]?.invoice_no || data?.invoice_no || data;
      
      toast.success(t("buyTpc.invoiceCreated"));
      navigate(withLang(`/invoice/${invoiceNo}`));
    } catch (error) {
      logger.error('Failed to create invoice', { error });
      toast.error(t("buyTpc.invoiceCreationFailed"));
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
               legalConsent &&
               !isSubmitting;

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("buyTpc.title")}</h1>
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
                    // Fallback if not array
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stages.map((stage) => (
            <Card key={stage.id} className={`card-premium ${stage.stage === selectedStage ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t(`buyTpc.${stage.stage}.title`)}</CardTitle>
                  <Badge className={getStatusColor(stage.status)}>
                    {safeT(`buyTpc.${stage.stage}.status.${stage.status.toLowerCase()}`, 
                      stage.status.charAt(0) + stage.status.slice(1).toLowerCase())}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("buyTpc.stage1.supply")}:</span>
                    <div className="font-semibold">{stage.supply.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("buyTpc.stage1.price")}:</span>
                    <div className="font-semibold">{formatUsd(priceUsd)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="text-muted-foreground">{t("buyTpc.stage1.countdown")}:</span>
                  <span className="font-semibold">{getTimeRemaining(stage.end_date)}</span>
                </div>

                {stage.stage === selectedStage && (
                  <Button 
                    onClick={() => setSelectedStage(stage.stage)}
                    className="w-full"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selected
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DEX Plan Card */}
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("buyTpc.dexPlan.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">{t("buyTpc.dexPlan.subtitle")}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">$0.005</span>
              <Badge variant="secondary">{t("buyTpc.dexPlan.plannedPrice")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{t("buyTpc.dexPlan.disclaimer")}</p>
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
              <>
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

                  {/* Order Summary - MOVED HERE */}
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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>{t("buyTpc.purchase.paymentMethod")}</Label>
                    <Select value={selectedPayment} onValueChange={handlePaymentMethodChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("buyTpc.purchase.selectPayment")} />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {safeT(`buyTpc.paymentMethods.${method.id}`, method.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPaymentMethod && (
                    <div className="mt-6">
                      {/* Crypto Address Display */}
                        {selectedPaymentMethod.type === 'crypto' && selectedPaymentMethod.address && (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-300 text-sm font-medium">Destination Address</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedPaymentMethod.address!);
                                  toast.success(t("buyTpc.addressCopied"));
                                }}
                                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white transition-all duration-200"
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Copy</span>
                                </span>
                              </Button>
                            </div>
                            <div className="font-mono text-sm bg-black/50 border border-gray-600 rounded-lg p-4 break-all text-gray-100 leading-relaxed">
                              {selectedPaymentMethod.address}
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Tap to copy address</span>
                            </div>
                          </div>
                        )}

                        {/* E-wallet Display */}
                        {selectedPaymentMethod.type === 'ewallet' && selectedPaymentMethod.address && (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-300 text-sm font-medium">{selectedPaymentMethod.name} Number</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedPaymentMethod.address!);
                                  toast.success(t("buyTpc.numberCopied"));
                                }}
                                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white transition-all duration-200"
                              >
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span>Copy</span>
                                </span>
                              </Button>
                            </div>
                            <div className="font-mono text-sm bg-black/50 border border-gray-600 rounded-lg p-4 break-all text-gray-100 leading-relaxed">
                              {selectedPaymentMethod.address}
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Tap to copy number</span>
                            </div>
                          </div>
                        )}

                        {/* Bank Transfer Display - REMOVED */}
                    </div>
                  )}
                </div>

                {/* Legal Consent Checkbox */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="legal-consent" 
                      checked={legalConsent}
                      onCheckedChange={(checked) => setLegalConsent(checked as boolean)}
                    />
                    <Label htmlFor="legal-consent" className="text-sm">
                      {t("buyTpc.agreeTerms")}
                      <div className="flex gap-2 mt-1">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs underline"
                          onClick={() => window.open(withLang('/terms'), '_blank')}
                        >
                          {t("buyTpc.terms")}
                        </Button>
                        <span>•</span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs underline"
                          onClick={() => window.open(withLang('/risk-disclosure'), '_blank')}
                        >
                          {t("buyTpc.risk")}
                        </Button>
                        <span>•</span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-xs underline"
                          onClick={() => window.open(withLang('/disclaimer'), '_blank')}
                        >
                          {t("buyTpc.disclaimer")}
                        </Button>
                      </div>
                    </Label>
                  </div>
                  
                  {!isValidAmount && tpcAmount && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("buyTpc.invalidAmount")}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Optional: Detailed terms dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setActiveTab('terms')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t("buyTpc.purchase.readTerms")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-white">
                          {legalContent[lang][activeTab].title}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                          {lang === 'en' 
                            ? 'Read the Terms, Risk Disclosure, and Disclaimer before proceeding.'
                            : 'Baca Syarat, Risiko, dan Disklaimer sebelum melanjutkan.'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      
                      {/* Tab Buttons */}
                      <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setActiveTab('terms')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'terms'
                              ? 'border-[#F0B90B] text-[#F0B90B]'
                              : 'border-transparent text-gray-300 hover:text-gray-100'
                          }`}
                        >
                          {lang === 'en' ? 'Terms' : 'Syarat'}
                        </button>
                        <button
                          onClick={() => setActiveTab('risk')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'risk'
                              ? 'border-[#F0B90B] text-[#F0B90B]'
                              : 'border-transparent text-gray-300 hover:text-gray-100'
                          }`}
                        >
                          {lang === 'en' ? 'Risk' : 'Risiko'}
                        </button>
                        <button
                          onClick={() => setActiveTab('disclaimer')}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'disclaimer'
                              ? 'border-[#F0B90B] text-[#F0B90B]'
                              : 'border-transparent text-gray-300 hover:text-gray-100'
                          }`}
                        >
                          {lang === 'en' ? 'Disclaimer' : 'Disklaimer'}
                        </button>
                      </div>
                      
                      {/* Content */}
                      <div className="mt-4 max-h-[60vh] overflow-y-auto">
                        <div className="text-sm leading-7 whitespace-pre-line text-gray-200">
                          {legalContent[lang][activeTab].body}
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button variant="outline" onClick={() => setActiveTab('terms')}>
                          {lang === 'en' ? 'Close' : 'Tutup'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button 
                  onClick={handleCreateInvoice}
                  disabled={!canBuy}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t("buyTpc.creatingInvoice")}
                    </>
                  ) : (
                    t("buyTpc.createInvoiceButton")
                  )}
                </Button>
              </>
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
                // Fallback if not array
                return null;
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Legal Tabs */}
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
    </PremiumShell>
  );
};

export default BuyTpcPage;
