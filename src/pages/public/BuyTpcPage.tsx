import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
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
        console.error("Failed to load data:", error);
        toast.error("Failed to load presale data");
      }
    };
    loadData();
  }, []);

  const currentStage = stages.find(s => s.stage === selectedStage);
  const calculatedUsd = tpcAmount && currentStage ? 
    (parseFloat(tpcAmount) * currentStage.price_usd).toFixed(2) : "0.00";
  const calculatedIdr = tpcAmount && currentStage ? 
    (parseFloat(tpcAmount) * currentStage.price_usd * 17000).toFixed(2) : "0.00";

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
      console.error("Failed to create invoice:", error);
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
                <div className="grid md:grid-cols-2 gap-6">
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
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {selectedPaymentMethod.instructions}
                          {selectedPaymentMethod.address && (
                            <div className="mt-1 font-mono text-xs bg-muted p-2 rounded">
                              {selectedPaymentMethod.address}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Price Calculation */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Price Calculation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t("buyTpc.purchase.tpcAmount")}:</span>
                      <span>{tpcAmount || "0"} TPC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("buyTpc.purchase.totalUsdc")}:</span>
                      <span>${calculatedUsd} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("buyTpc.purchase.totalIdr")}:</span>
                      <span>Rp {calculatedIdr}</span>
                    </div>
                  </div>
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
                      <Button variant="link" className="p-0 h-auto text-sm">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t("buyTpc.purchase.readTerms")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Terms & Conditions</DialogTitle>
                        <DialogDescription>
                          Please read the terms and conditions carefully before proceeding.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto text-sm">
                        {/* TODO: Add actual terms content */}
                        <p>Terms and conditions content will be displayed here...</p>
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
                  {isSubmitting ? "Processing..." : t("buyTpc.purchase.buyButton")}
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
