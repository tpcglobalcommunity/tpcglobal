import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  FileText, 
  Clock,
  ExternalLink,
  Copy,
  Mail,
  Upload,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  QrCode
} from "lucide-react";
import { getInvoicePublic, type InvoicePublic } from "@/lib/rpc/public";
import { submitPaymentConfirmation } from "@/lib/rpc/paymentConfirmation";
import { formatIdr } from "@/lib/tokenSale";
import { uploadInvoiceProof, validateProofFile } from "@/lib/storage/uploadInvoiceProof";
import { PAYMENT_DESTINATIONS } from "@/config/paymentDestinations";
import QRCode from "qrcode";

const InvoiceDetailPage = () => {
  const { t, lang, withLang } = useI18n();
  const { invoice_no } = useParams<{ invoice_no: string }>();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<InvoicePublic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  
  // Payment confirmation form state
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [payerName, setPayerName] = useState<string>("");
  const [payerRef, setPayerRef] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string>("");
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Prevent double fetch in StrictMode
  const hasFetchedRef = useRef<string | null>(null);

  // Generate QR code when payment method changes to crypto
  useEffect(() => {
    if (paymentMethod && PAYMENT_DESTINATIONS[paymentMethod]?.type === 'crypto') {
      const destination = PAYMENT_DESTINATIONS[paymentMethod];
      if (destination.details.address) {
        generateQRCode(destination.details.address);
      }
    } else {
      setQrCodeUrl("");
    }
  }, [paymentMethod]);

  useEffect(() => {
    const loadInvoice = async () => {
      // Only fetch if we have an invoice number
      if (!invoice_no) {
        return;
      }

      // Prevent double fetch in StrictMode
      if (hasFetchedRef.current === invoice_no) {
        return;
      }
      hasFetchedRef.current = invoice_no;

      setLoading(true);
      try {
        const data = await getInvoicePublic(invoice_no);
        if (data) {
          setInvoice(data);
        } else {
          // Use logger.info for "not found" case
          logger.info('Invoice not found', { invoice_no });
          toast.info("Invoice tidak ditemukan atau sudah tidak aktif.");
          navigate(withLang("/"));
        }
      } catch (error) {
        logger.info('Failed to load invoice', { error, invoice_no });
        toast.info("Gagal memuat invoice. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoice_no, navigate, withLang]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID': return 'bg-yellow-500';
      case 'PENDING_REVIEW': return 'bg-blue-500';
      case 'PAID': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmitConfirmation = async () => {
    if (!invoice) return;
    if (!paymentMethod) {
      toast.error("Payment method is required");
      return;
    }
    if (!proofUrl) {
      toast.error(lang === 'en' ? 'Proof of payment is required' : 'Bukti pembayaran wajib diisi');
      return;
    }

    setConfirming(true);
    try {
      await submitPaymentConfirmation({
        invoice_no: invoice.invoice_no,
        payment_method: paymentMethod,
        payer_name: payerName || null,
        payer_ref: payerRef || null,
        tx_signature: null, // Removed - upload only flow
        proof_url: proofUrl
      });
      
      toast.success("Payment confirmation submitted successfully!");
      
      // Reload invoice to get updated status
      const updatedInvoice = await getInvoicePublic(invoice.invoice_no);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
      }
      
      // Reset form
      setPaymentMethod("");
      setPayerName("");
      setPayerRef("");
      setProofUrl("");
      setProofFile(null);
    } catch (error) {
      logger.error('Failed to submit payment confirmation', { error });
      toast.error("Failed to submit payment confirmation");
    } finally {
      setConfirming(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proofFile || !invoice) return;

    // Validate file before upload
    const validation = validateProofFile(proofFile);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setUploadingProof(true);
    try {
      const result = await uploadInvoiceProof({
        file: proofFile,
        invoiceNo: invoice.invoice_no
      });

      if (result.success && result.proofUrl) {
        setProofUrl(result.proofUrl);
        setProofFile(null);
        toast.success(lang === 'en' ? '✅ Proof uploaded successfully!' : '✅ Bukti berhasil diunggah!');
      } else {
        toast.error(result.error || (lang === 'en' ? 'Failed to upload proof' : 'Gagal mengunggah bukti'));
      }
    } catch (error) {
      logger.error('Failed to upload proof', { error });
      toast.error(lang === 'en' ? 'Failed to upload proof' : 'Gagal mengunggah bukti');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("confirm.destination.copied"));
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success(t("confirm.destination.copied"));
      setCopiedText(text);
      setTimeout(() => setCopiedText(""), 2000);
    }
  };

  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#fbbf24',
          light: '#0b0f14'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      logger.error('Failed to generate QR code', error);
    }
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
      <div className="container-app section-spacing">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container-app section-spacing">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invoice tidak ditemukan atau sudah tidak aktif.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUnpaid = invoice.status === 'UNPAID';
  const isPendingReview = invoice.status === 'PENDING_REVIEW';
  const isPaid = invoice.status === 'PAID';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'PENDING_REVIEW':
        return 'bg-primary text-primary-foreground';
      case 'PAID':
        return 'bg-success/10 text-success border-success/20';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container-app section-spacing">
      {/* Invoice Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${getStatusBadge(invoice.status)}`}>
          <FileText className="h-4 w-4" />
          <span className="text-xs font-medium">
            {t(`status.${invoice.status.toLowerCase()}`) || invoice.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gradient-gold mb-2">{invoice.invoice_no}</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {invoice.status === 'UNPAID' ? 'Menunggu Pembayaran' : t(`status.${invoice.status.toLowerCase()}`) || `Status: ${invoice.status}`}
        </p>
      </div>

      {/* Payment Confirmation Form - Only show for UNPAID invoices */}
      {isUnpaid && (
        <Card className="card-premium mb-8">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Upload className="h-6 w-6 text-primary" />
              {t("confirm.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("confirm.subtitle")}
            </p>
          </CardHeader>
          
          {/* Stepper */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center space-x-4 md:space-x-8">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  proofUrl ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {proofUrl ? '✓' : '1'}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{t("confirm.steps.upload")}</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-border max-w-8"></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  proofUrl ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{t("confirm.steps.review")}</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-border max-w-8"></div>
              
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  proofUrl ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{t("confirm.steps.submit")}</span>
              </div>
            </div>
          </div>
          
          <CardContent className="space-y-6 pt-0">
            {/* Payment Method Selection */}
            <div>
              <Label htmlFor="paymentMethod">{t("confirm.method")}</Label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-popover text-popover-foreground border-border hover:border-primary/50 transition-colors [&:not(:disabled)]:cursor-pointer"
                required
              >
                <option value="" className="bg-popover text-popover-foreground">{t("confirm.selectPayment")}</option>
                <option value="BANK" className="bg-popover text-popover-foreground hover:bg-primary hover:text-primary-foreground">Transfer Bank</option>
                <option value="USDC" className="bg-popover text-popover-foreground hover:bg-primary hover:text-primary-foreground">USDC</option>
                <option value="SOL" className="bg-popover text-popover-foreground hover:bg-primary hover:text-primary-foreground">SOL</option>
              </select>
            </div>
            
            {/* Payment Destination Card */}
            {paymentMethod && PAYMENT_DESTINATIONS[paymentMethod] && (
              <Card className="card-premium border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="h-5 w-5 text-primary" />
                    {t("confirm.destination.title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("confirm.destination.subtitle")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PAYMENT_DESTINATIONS[paymentMethod].type === 'bank' ? (
                    // Bank Details
                    <>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("confirm.destination.bankName")}:</span>
                          <span className="text-sm text-foreground font-medium">{PAYMENT_DESTINATIONS[paymentMethod].details.bankName}</span>
                        </div>
                        <div className="flex flex-col sm:flex sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("confirm.destination.accountName")}:</span>
                          <span className="text-sm text-foreground font-medium">{PAYMENT_DESTINATIONS[paymentMethod].details.accountName}</span>
                        </div>
                        <div className="flex flex-col sm:flex sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{t("confirm.destination.accountNumber")}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted px-3 py-2 rounded-md border border-border flex-1 min-w-0">
                              {PAYMENT_DESTINATIONS[paymentMethod].details.accountNumber}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_DESTINATIONS[paymentMethod].details.accountNumber!)}
                              className="h-8 px-3 flex-shrink-0"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {copiedText === PAYMENT_DESTINATIONS[paymentMethod].details.accountNumber ? t("confirm.destination.copied") : t("confirm.destination.copy")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Crypto Details (USDC/SOL)
                    <>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex sm:items-center sm:justify-between gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {paymentMethod === 'USDC' ? t("confirm.destination.usdcLabel") : t("confirm.destination.solLabel")}:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted px-3 py-2 rounded-md border border-border flex-1 min-w-0 max-w-[300px] truncate">
                              {PAYMENT_DESTINATIONS[paymentMethod].details.address}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(PAYMENT_DESTINATIONS[paymentMethod].details.address!)}
                              className="h-8 px-3 flex-shrink-0"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              {copiedText === PAYMENT_DESTINATIONS[paymentMethod].details.address ? t("confirm.destination.copied") : t("confirm.destination.copy")}
                            </Button>
                          </div>
                        </div>
                        
                        {/* QR Code */}
                        {qrCodeUrl && (
                          <div className="text-center space-y-3">
                            <p className="text-xs text-muted-foreground">{t("confirm.destination.qrLabel")}</p>
                            <div className="inline-flex justify-center">
                              <div className="p-3 bg-muted rounded-lg border border-border">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="QR Code" 
                                  className="w-48 h-48"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Optional Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payerName">{t("confirm.payerName") || "Nama Pengirim (Opsional)"}</Label>
                <Input
                  id="payerName"
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              
              <div>
                <Label htmlFor="payerRef">{t("confirm.payerRef") || "Referensi (Opsional)"}</Label>
                <Input
                  id="payerRef"
                  type="text"
                  value={payerRef}
                  onChange={(e) => setPayerRef(e.target.value)}
                  placeholder="No. Referensi Bank"
                />
              </div>
            </div>
            
            {/* Upload Area - REQUIRED */}
            <div className="space-y-3">
              <Label htmlFor="proofFile">{t("confirm.proof")} *</Label>
              
              {!proofUrl ? (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    id="proofFile"
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                  />
                  <label htmlFor="proofFile" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-foreground mb-2">{t("confirm.proof")}</p>
                    <p className="text-xs text-muted-foreground mb-3">{t("confirm.proofHelper")}</p>
                    <p className="text-xs text-muted-foreground">{t("confirm.maxSize")}</p>
                  </label>
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{proofFile?.name}</p>
                        <p className="text-xs text-green-600">{t("confirm.proofSuccess")}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('proofFile')?.click()}
                    >
                      {t("confirm.changeFile")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmitConfirmation}
                disabled={confirming || !paymentMethod || !proofUrl}
                className="w-full"
                size="lg"
              >
                {confirming ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2" />
                    {t("confirm.submitting")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t("confirm.submit")}
                  </>
                )}
              </Button>
              
              {/* Validation Error */}
              {!proofUrl && (
                <p className="text-sm text-destructive text-center">
                  {t("confirm.proofRequired")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Status - Show for PENDING_REVIEW/PAID */}
      {(isPendingReview || isPaid) && (
        <Card className="card-premium mb-8">
          <CardContent className="text-center py-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${getStatusBadge(invoice.status)}`}>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {t("confirm.alreadySubmitted")}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("confirm.pending")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isPendingReview 
                ? "Konfirmasi pembayaran Anda telah diterima dan sedang ditinjau oleh admin."
                : "Pembayaran Anda telah disetujui. Terima kasih!"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invoice Details */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detail Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Jumlah TPC:</span>
              <div className="font-semibold">{invoice.tpc_amount.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total USD:</span>
              <div className="font-semibold">${invoice.total_usd}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total IDR:</span>
              <div className="font-semibold">{formatIdr(invoice.total_idr)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Dibuat:</span>
              <div className="font-semibold">{formatDate(invoice.created_at)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Alamat Treasury:</span>
              <div className="font-mono text-sm bg-muted p-2 rounded">
                {invoice.treasury_address}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Informasi Penting:</strong> 
              Pastikan kembali ke halaman ini untuk melihat status pembayaran Anda setelah admin melakukan review.
            </p>
            <p className="mb-2">
              <strong>Penting:</strong> 
              Jika ada masalah dengan pembayaran, silakan hubungi admin melalui fitur kontak di website.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => copyToClipboard(invoice.invoice_no)}
              variant="outline"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Salin Invoice No
            </Button>
            
            <Button
              onClick={() => copyToClipboard(invoice.treasury_address)}
              variant="outline"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Salin Alamat Treasury
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Back Navigation */}
      <div className="text-center">
        <Button
          onClick={() => navigate(withLang("/"))}
          variant="outline"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
