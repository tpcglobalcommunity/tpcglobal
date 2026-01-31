import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n/i18n";
import { logger } from "@/lib/logger";
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
  Mail,
  Upload,
  Image,
  File
} from "lucide-react";
import { getInvoicePublic, type InvoicePublic } from "@/lib/rpc/public";
import { submitPaymentConfirmation } from "@/lib/rpc/paymentConfirmation";
import { formatIdr } from "@/lib/tokenSale";
import { uploadInvoiceProof, validateProofFile } from "@/lib/storage/uploadInvoiceProof";

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
  const [txSignature, setTxSignature] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Prevent double fetch in StrictMode
  const hasFetchedRef = useRef<string | null>(null);

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
        tx_signature: txSignature || null,
        proof_url: proofUrl || null
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
      setTxSignature("");
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

  return (
    <div className="container-app section-spacing">
      {/* Invoice Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
          <span className="text-xs text-primary font-medium">
            {invoice.status === 'UNPAID' ? 'Unpaid' : invoice.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gradient-gold mb-2">{invoice.invoice_no}</h1>
        <p className="text-xl text-foreground max-w-2xl mx-auto">
          {invoice.status === 'UNPAID' ? 'Menunggu Pembayaran' : 'Status: ' + invoice.status}
        </p>
      </div>

      {/* Payment Confirmation Form - Only show for UNPAID invoices */}
      {isUnpaid && (
        <Card className="card-premium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Konfirmasi Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Pilih metode pembayaran</option>
                  <option value="BANK">Transfer Bank</option>
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="payerName">Nama Pengirim (Opsional)</Label>
                <Input
                  id="payerName"
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </div>
              
              <div>
                <Label htmlFor="payerRef">Referensi (Opsional)</Label>
                <Input
                  id="payerRef"
                  type="text"
                  value={payerRef}
                  onChange={(e) => setPayerRef(e.target.value)}
                  placeholder="No. Referensi Bank"
                />
              </div>
              
              <div>
                <Label htmlFor="txSignature">Tanda Tangan Transaksi (Opsional)</Label>
                <Input
                  id="txSignature"
                  type="text"
                  value={txSignature}
                  onChange={(e) => setTxSignature(e.target.value)}
                  placeholder="Tanda tangan digital"
                />
              </div>
              
              <div>
                <Label htmlFor="proofUrl">URL Bukti Pembayaran</Label>
                <Input
                  id="proofUrl"
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://example.com/proof.jpg"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSubmitConfirmation}
                disabled={confirming || !paymentMethod}
                className="flex-1"
                size="lg"
              >
                {confirming ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Kirim Konfirmasi
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleProofUpload}
                disabled={uploadingProof || !proofFile}
                variant="outline"
                className="flex-1"
              >
                {uploadingProof ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Bukti
                  </>
                )}
              </Button>
            </div>
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
