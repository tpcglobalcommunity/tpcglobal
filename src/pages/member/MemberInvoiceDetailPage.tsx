import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Upload, Loader2, ArrowLeft, Calendar, DollarSign, Wallet, CheckCircle, XCircle, AlertCircle, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { getMyInvoice, type MemberInvoice } from "@/lib/rpc/memberInvoices";
import { submitPaymentConfirmation } from "@/lib/rpc/paymentConfirmation";
import { uploadInvoiceProof, type UploadProofOptions } from "@/lib/storage/uploadInvoiceProof";

const MemberInvoiceDetailPage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { invoiceNo } = useParams<{ invoiceNo: string }>();
  
  const [invoice, setInvoice] = useState<MemberInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    payment_method: "",
    payer_name: "",
    payer_ref: "",
    tx_signature: "",
  });

  useEffect(() => {
    if (invoiceNo) {
      loadInvoice(invoiceNo);
    }
  }, [invoiceNo]);

  const loadInvoice = async (invoiceNo: string) => {
    try {
      setLoading(true);
      const data = await getMyInvoice(invoiceNo);
      setInvoice(data);
    } catch (error: any) {
      console.error("Failed to load invoice:", error);
      toast.error(error.message || t("member.toast.invoiceNotFound"));
      navigate(`/${lang}/member`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        toast.error(t("member.confirm.uploadHint"));
        return;
      }

      if (file.size > maxSize) {
        toast.error(t("member.confirm.uploadHint"));
        return;
      }

      setProofFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice || !proofFile) {
      toast.error("Please upload payment proof");
      return;
    }

    try {
      setSubmitting(true);

      // Upload proof to storage
      const uploadResult = await uploadInvoiceProof({ 
        file: proofFile, 
        invoiceNo: invoice.invoice_no 
      });
      
      if (!uploadResult.success || !uploadResult.proofUrl) {
        throw new Error(uploadResult.error || "Failed to upload proof");
      }
      
      // Submit payment confirmation
      await submitPaymentConfirmation({
        invoice_no: invoice.invoice_no,
        payment_method: formData.payment_method || "Bank Transfer",
        payer_name: formData.payer_name || undefined,
        payer_ref: formData.payer_ref || undefined,
        tx_signature: formData.tx_signature || undefined,
        proof_url: uploadResult.proofUrl,
      });

      toast.success(t("member.toast.submitSuccess"));
      
      // Reload invoice to get updated status
      await loadInvoice(invoice.invoice_no);
      
      // Reset form
      setProofFile(null);
      setPreviewUrl("");
      setFormData({
        payment_method: "",
        payer_name: "",
        payer_ref: "",
        tx_signature: "",
      });
      
    } catch (error: any) {
      console.error("Failed to submit confirmation:", error);
      toast.error(error.message || t("member.toast.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'PENDING_REVIEW':
        return <AlertCircle className="w-6 h-6 text-blue-500" />;
      case 'PAID':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'EXPIRED':
        return <Clock className="w-6 h-6 text-gray-500" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-gray-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'PENDING_REVIEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PAID':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXPIRED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container-app section-spacing">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Loading Invoice...
              </h2>
              <p className="text-gray-300">
                Please wait while we fetch your invoice details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container-app section-spacing">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {t("member.toast.invoiceNotFound")}
            </h1>
            <button
              onClick={() => navigate(`/${lang}/member`)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container-app section-spacing">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/${lang}/member`)}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Invoice Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {invoice.invoice_no}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusIcon(invoice.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                  {t(`member.status.${invoice.status.toLowerCase()}`)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {formatDate(invoice.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Order Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">TPC Amount:</span>
                  <span className="text-white font-medium">{invoice.tpc_amount} TPC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total USD:</span>
                  <span className="text-white font-medium">{formatCurrency(invoice.total_usd, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total IDR:</span>
                  <span className="text-white font-medium">{formatCurrency(invoice.total_idr, 'IDR')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white font-medium">{invoice.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {(invoice.status === 'UNPAID' || invoice.status === 'REJECTED') && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Payment Instructions
            </h2>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm">
                Please transfer the exact amount to the treasury address and upload the payment proof below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Treasury Address</h3>
                <div className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-white">
                  {/* This should come from config or RPC */}
                  TBC... (Treasury Address)
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Amount to Transfer</h3>
                <div className="bg-black/30 border border-white/10 rounded-lg p-3">
                  <div className="text-white font-medium">{formatCurrency(invoice.total_idr, 'IDR')}</div>
                  <div className="text-gray-400 text-sm">{formatCurrency(invoice.total_usd, 'USD')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Form */}
        {(invoice.status === 'UNPAID' || invoice.status === 'REJECTED') && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t("member.confirm.title")}
            </h2>
            
            <p className="text-gray-300 text-sm mb-6">
              {t("member.confirm.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t("member.confirm.paymentMethod")}
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Crypto">Crypto</option>
                </select>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t("member.confirm.payerName")} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.payer_name}
                    onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t("member.confirm.payerRef")} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.payer_ref}
                    onChange={(e) => setFormData({ ...formData, payer_ref: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Reference number"
                  />
                </div>
              </div>

              {/* Transaction Signature (for crypto) */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t("member.confirm.txSignature")} (Optional)
                </label>
                <textarea
                  value={formData.tx_signature}
                  onChange={(e) => setFormData({ ...formData, tx_signature: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Transaction hash or signature"
                  rows={3}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {t("member.confirm.proofUpload")} <span className="text-red-400">*</span>
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-300">
                      {proofFile ? proofFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {t("member.confirm.uploadHint")}
                    </span>
                  </label>
                </div>
                
                {/* Preview */}
                {previewUrl && (
                  <div className="mt-4">
                    <img
                      src={previewUrl}
                      alt="Proof preview"
                      className="max-w-full h-auto rounded-lg border border-white/10"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !proofFile}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Submitting...
                  </>
                ) : (
                  t("member.confirm.submit")
                )}
              </button>
            </form>
          </div>
        )}

        {/* Status Messages */}
        {invoice.status === 'PENDING_REVIEW' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("member.confirm.waitingReview")}
            </h3>
            <p className="text-gray-300">
              Your payment confirmation has been submitted and is being reviewed by our team.
            </p>
          </div>
        )}

        {invoice.status === 'PAID' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {t("member.confirm.alreadyPaid")}
            </h3>
            <p className="text-gray-300">
              This invoice has been paid and confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberInvoiceDetailPage;
