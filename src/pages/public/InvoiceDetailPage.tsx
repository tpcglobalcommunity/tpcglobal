import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { PremiumShell } from "@/components/layout/PremiumShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Copy,
  Mail
} from "lucide-react";
import { getInvoicePublic, confirmInvoicePublic, type InvoicePublic } from "@/lib/rpc/public";
import { formatIdr } from "@/lib/tokenSale";

const InvoiceDetailPage = () => {
  const { t, lang, withLang } = useI18n();
  const { invoice_no } = useParams<{ invoice_no: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [invoice, setInvoice] = useState<InvoicePublic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  
  // Prevent double fetch in StrictMode
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      // Debug: Log when this effect runs
      if (process.env.NODE_ENV === 'development') {
        console.info('[Invoice] Effect triggered for invoice_no:', invoice_no);
        console.info('[Invoice] Current pathname:', location.pathname);
      }

      // Strong guard: Only fetch if we're actually on an invoice route
      const isInvoiceRoute = location.pathname.includes('/invoice/');
      if (!isInvoiceRoute || !invoice_no) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[Invoice] Not on invoice route or no invoice_no, skipping fetch');
          console.info('[Invoice] isInvoiceRoute:', isInvoiceRoute, 'invoice_no:', invoice_no);
        }
        return;
      }

      // Prevent double fetch in StrictMode
      if (hasFetchedRef.current === invoice_no) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[Invoice] Already fetched, skipping:', invoice_no);
        }
        return;
      }
      hasFetchedRef.current = invoice_no;

      if (process.env.NODE_ENV === 'development') {
        console.info('[Invoice] Starting fetch for:', invoice_no);
      }

      setLoading(true);
      try {
        const data = await getInvoicePublic(invoice_no);
        if (data) {
          setInvoice(data);
          if (process.env.NODE_ENV === 'development') {
            console.info('[Invoice] Successfully loaded:', invoice_no);
          }
        } else {
          // Use console.info instead of error for "not found" case
          if (process.env.NODE_ENV === 'development') {
            console.info('[Invoice] Not found:', invoice_no);
          }
          toast.info("Invoice tidak ditemukan atau sudah tidak aktif.");
          navigate(withLang("/"));
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.info('[Invoice] Failed to load:', error);
        }
        toast.info("Gagal memuat invoice. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoice_no, navigate, withLang, location.pathname]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'CONFIRMED': return 'bg-blue-500';
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleConfirmPayment = async () => {
    if (!invoice) return;

    setConfirming(true);
    try {
      const result = await confirmInvoicePublic(invoice.invoice_no);
      if (result.success) {
        toast.success(result.message);
        setShowConfirmDialog(true);
        // Reload invoice to get updated status
        const updatedInvoice = await getInvoicePublic(invoice.invoice_no);
        if (updatedInvoice) {
          setInvoice(updatedInvoice);
        }
      } else {
        toast.error(t("invoice.confirmError"));
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      toast.error(t("invoice.confirmError"));
    } finally {
      setConfirming(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proofFile || !invoice) return;

    setUploadingProof(true);
    try {
      // Mock upload - in real implementation, upload to Supabase storage
      toast.success(lang === 'en' ? '✅ Proof received. Admin will check during operational hours.' : '✅ Bukti diterima. Admin akan mengecek dalam jam operasional.');
      setProofFile(null);
      
      // Reload invoice to get updated status
      const updatedInvoice = await getInvoicePublic(invoice.invoice_no);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
      }
    } catch (error) {
      console.error("Failed to upload proof:", error);
      toast.error(lang === 'en' ? 'Failed to upload proof' : 'Gagal mengupload bukti');
    } finally {
      setUploadingProof(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const getSolscanLink = (txHash: string) => {
    return `https://solscan.io/tx/${txHash}`;
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="container-app section-spacing">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading invoice...</p>
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (!invoice) {
    return (
      <PremiumShell>
        <div className="container-app section-spacing">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Invoice tidak ditemukan atau sudah tidak aktif.</AlertDescription>
          </Alert>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="container-app section-spacing">
        <div className="text-center mb-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">{t("invoice.title")}</h1>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Invoice Header */}
          <Card className="card-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{invoice.invoice_no}</CardTitle>
                <Badge className={getStatusColor(invoice.status)}>
                  {t(`invoice.statuses.${invoice.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.stage")}:</span>
                    <div className="font-semibold">{invoice.stage.toUpperCase()}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.buyerEmail")}:</span>
                    <div className="font-semibold">{invoice.buyer_email}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.createdAt")}:</span>
                    <div className="font-semibold">{formatDate(invoice.created_at)}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.paidAt")}:</span>
                    <div className="font-semibold">{formatDate(invoice.paid_at)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.confirmedAt")}:</span>
                    <div className="font-semibold">{formatDate(invoice.confirmed_at)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t("invoice.approvedAt")}:</span>
                    <div className="font-semibold">{formatDate(invoice.approved_at)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Details */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">{t("invoice.tpcAmount")}:</span>
                  <div className="text-2xl font-bold">{invoice.tpc_amount.toLocaleString()} TPC</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t("invoice.priceUsd")}:</span>
                  <div className="text-2xl font-bold">${invoice.price_usd}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">{t("invoice.totalUsd")}:</span>
                  <div className="text-xl font-semibold">${invoice.total_usd}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">{t("invoice.totalIdr")}:</span>
                  <div className="text-xl font-semibold">{formatIdr(invoice.total_idr)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="card-premium">
            <CardHeader>
              <CardTitle>{t("invoice.paymentMethod")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Method:</span>
                <div className="font-semibold">{invoice.payment_method}</div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">{t("invoice.treasuryAddress")}:</span>
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm bg-muted p-2 rounded flex-1">
                    {invoice.treasury_address}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(invoice.treasury_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {invoice.tx_hash && (
                <div>
                  <span className="text-sm text-muted-foreground">{t("invoice.txHash")}:</span>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm bg-muted p-2 rounded flex-1">
                      {invoice.tx_hash}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(invoice.tx_hash!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={getSolscanLink(invoice.tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {invoice.admin_note && (
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t("invoice.adminNote")}:</strong> {invoice.admin_note}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Proof Upload Section */}
          {invoice.status === 'PENDING' && (
            <Card className="card-premium">
              <CardHeader>
                <CardTitle>{lang === 'en' ? 'Upload Payment Proof' : 'Upload Bukti Pembayaran'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proof-file">{lang === 'en' ? 'Payment Proof (Image)' : 'Bukti Pembayaran (Gambar)'}</Label>
                  <Input
                    id="proof-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                  {proofFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {lang === 'en' ? 'Selected file:' : 'File dipilih:'} {proofFile.name}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={handleProofUpload}
                  disabled={!proofFile || uploadingProof}
                  className="w-full"
                  size="lg"
                >
                  {uploadingProof ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {lang === 'en' ? 'Uploading...' : 'Mengupload...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {lang === 'en' ? 'Submit Proof' : 'Kirim Bukti'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {invoice.status === 'PENDING' && (
              <Button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="flex-1"
                size="lg"
              >
                {confirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t("invoice.confirmPayment")}
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.open(`mailto:support@tpcglobal.io?subject=Invoice ${invoice.invoice_no}`, '_blank')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Payment Confirmation Received
              </DialogTitle>
              <DialogDescription>
                {t("invoice.confirmSuccess")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Our admin team will verify your payment during business hours. You will receive an email once the process is complete.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => setShowConfirmDialog(false)}
                className="w-full"
              >
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PremiumShell>
  );
};

export default InvoiceDetailPage;
