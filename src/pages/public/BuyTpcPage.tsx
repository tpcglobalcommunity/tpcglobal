import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { formatIdr } from "@/lib/tokenSale";

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
  const [activeTab, setActiveTab] = useState<'terms' | 'risk' | 'disclaimer'>('terms');

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
  const calculatedUsd = tpcAmount && currentStage ? 
    (parseFloat(tpcAmount) * currentStage.price_usd).toFixed(2) : "0.00";
  const calculatedIdr = tpcAmount && currentStage ? 
    formatIdr(parseFloat(tpcAmount) * currentStage.price_usd * 17000) : formatIdr(0);

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

  const handleBuyTpc = async () => {
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
      const request: CreateInvoiceRequest = {
        stage: selectedStage,
        tpc_amount: parseFloat(tpcAmount),
        payment_method: selectedPayment,
        buyer_email: buyerEmail
      };

      const invoice = await createInvoicePublic(request);
      if (invoice) {
        toast.success("Invoice created successfully!");
        // TODO: Send invoice email
        navigate(withLang(`/invoice/${invoice.invoice_no}`));
      } else {
        toast.error("Failed to create invoice");
      }
    } catch (error) {
      logger.error('Failed to create invoice', { error });
      toast.error("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canBuy = currentStage?.status === 'ACTIVE' && tpcAmount && selectedPayment && buyerEmail && termsAccepted;

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("buyTpc.title")}</h1>
          <p className="text-muted-foreground">{t("buyTpc.subtitle")}</p>
        </div>

        {/* Stage Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stages.map((stage) => (
            <Card key={stage.id} className={`card-premium ${stage.stage === selectedStage ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t(`buyTpc.${stage.stage}.title`)}</CardTitle>
                  <Badge className={getStatusColor(stage.status)}>
                    {t(`buyTpc.${stage.stage}.status.${stage.status.toLowerCase()}`)}
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
                    <div className="font-semibold">${stage.price_usd}</div>
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
                            {t(`buyTpc.paymentMethods.${method.id}`)}
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
                                  toast.success("Address copied to clipboard!");
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
                                  toast.success("Number copied to clipboard!");
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

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      {t("buyTpc.purchase.terms")}
                    </Label>
                  </div>
                  
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
                  onClick={handleBuyTpc}
                  disabled={!canBuy || isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Processing..." : (lang === 'en' ? 'Create Invoice' : 'Buat Invoice')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PremiumShell>
  );
};

export default BuyTpcPage;
