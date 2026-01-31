import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Upload, Loader2, ArrowLeft, Calendar, DollarSign, Wallet, CheckCircle, XCircle, AlertCircle, Clock, Copy, Eye, Download } from "lucide-react";
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

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("member.toast.copySuccess"));
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleViewPublicInvoice = () => {
    if (invoice) {
      window.open(`/${lang}/invoice/${invoice.invoice_no}`, '_blank');
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
        return { bg: 'rgba(250,204,21,0.1)', text: '#FACC15', border: 'rgba(250,204,21,0.2)' };
      case 'PENDING_REVIEW':
        return { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6', border: 'rgba(59,130,246,0.2)' };
      case 'PAID':
        return { bg: 'rgba(34,197,94,0.1)', text: '#22C55E', border: 'rgba(34,197,94,0.2)' };
      case 'REJECTED':
        return { bg: 'rgba(239,68,68,0.1)', text: '#EF4444', border: 'rgba(239,68,68,0.2)' };
      case 'EXPIRED':
        return { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', border: 'rgba(107,114,128,0.2)' };
      case 'CANCELLED':
        return { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', border: 'rgba(107,114,128,0.2)' };
      default:
        return { bg: 'rgba(107,114,128,0.1)', text: '#6B7280', border: 'rgba(107,114,128,0.2)' };
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
      <div className="min-h-screen p-4" 
           style={{
             backgroundColor: '#0B0F17',
             background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%)'
           }}>
        <div className="container-app section-spacing">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#F0B90B' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
                Loading Invoice...
              </h2>
              <p style={{ color: '#9CA3AF' }}>
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
      <div className="min-h-screen p-4" 
           style={{
             backgroundColor: '#0B0F17',
             background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%)'
           }}>
        <div className="container-app section-spacing">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#E5E7EB' }}>
              {t("member.toast.invoiceNotFound")}
            </h1>
            <button
              onClick={() => navigate(`/${lang}/member`)}
              className="px-6 py-2 font-medium rounded-lg transition-all"
              style={{
                background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                color: '#111827'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" 
         style={{
           backgroundColor: '#0B0F17',
           background: 'radial-gradient(circle at top, rgba(240,185,11,0.08), transparent 40%)'
         }}>
      <div className="container-app section-spacing">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/${lang}/member`)}
          className="mb-6 flex items-center gap-2 transition-colors"
          style={{ color: '#9CA3AF' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#E5E7EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Invoice Header */}
        <div className="p-6 rounded-xl mb-6" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: '#E5E7EB' }}>
                {invoice.invoice_no}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusIcon(invoice.status)}
                <span className="px-3 py-1 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: getStatusColor(invoice.status).bg,
                        color: getStatusColor(invoice.status).text,
                        borderColor: getStatusColor(invoice.status).border
                      }}>
                  {t(`member.status.${invoice.status.toLowerCase()}`)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm" style={{ color: '#9CA3AF' }}>
                  {formatDate(invoice.created_at)}
                </div>
              </div>
              <button
                onClick={handleViewPublicInvoice}
                className="px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(240,185,11,0.4)';
                  e.currentTarget.style.color = '#F0B90B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = '#E5E7EB';
                }}
              >
                <Eye className="w-4 h-4" />
                {t("member.detail.openPublic")}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6 rounded-xl mb-6" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <FileText className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            Invoice Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Order Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#9CA3AF' }}>TPC Amount:</span>
                  <span className="font-medium" style={{ color: '#E5E7EB' }}>{invoice.tpc_amount} TPC</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9CA3AF' }}>Total USD:</span>
                  <span className="font-medium" style={{ color: '#E5E7EB' }}>{formatCurrency(invoice.total_usd, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#9CA3AF' }}>Total IDR:</span>
                  <span className="font-medium" style={{ color: '#E5E7EB' }}>{formatCurrency(invoice.total_idr, 'IDR')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#9CA3AF' }}>Email:</span>
                  <span className="font-medium" style={{ color: '#E5E7EB' }}>{invoice.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {(invoice.status === 'UNPAID' || invoice.status === 'REJECTED') && (
          <div className="p-6 rounded-xl mb-6" 
               style={{
                 backgroundColor: '#0F1624',
                 border: '1px solid rgba(240,185,11,0.25)'
               }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
              <Wallet className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
              Payment Instructions
            </h2>
            
            <div className="p-4 rounded-lg mb-4" 
                 style={{
                   backgroundColor: 'rgba(250,204,21,0.1)',
                   border: '1px solid rgba(250,204,21,0.2)'
                 }}>
              <p className="text-sm" style={{ color: '#FACC15' }}>
                Please transfer the exact amount to the treasury address and upload the payment proof below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                  {t("member.detail.treasury")}
                </h3>
                <div className="p-3 rounded-lg font-mono text-sm relative" 
                     style={{ 
                       backgroundColor: '#111827', 
                       border: '1px solid rgba(255,255,255,0.12)',
                       color: '#E5E7EB'
                     }}>
                  {/* This should come from config or RPC */}
                  TBC... (Treasury Address)
                  <button
                    onClick={() => handleCopyToClipboard("TBC... (Treasury Address)")}
                    className="absolute top-2 right-2 p-1 rounded transition-all hover:bg-[rgba(240,185,11,0.1)]"
                    style={{ color: '#9CA3AF' }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>
                  Amount to Transfer
                </h3>
                <div className="p-3 rounded-lg" 
                     style={{ 
                       backgroundColor: '#111827', 
                       border: '1px solid rgba(255,255,255,0.12)'
                     }}>
                  <div className="font-medium" style={{ color: '#E5E7EB' }}>{formatCurrency(invoice.total_idr, 'IDR')}</div>
                  <div className="text-sm" style={{ color: '#9CA3AF' }}>{formatCurrency(invoice.total_usd, 'USD')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Confirmation Form */}
        {(invoice.status === 'UNPAID' || invoice.status === 'REJECTED') && (
          <div className="p-6 rounded-xl" 
               style={{
                 backgroundColor: '#0F1624',
                 border: '1px solid rgba(240,185,11,0.25)'
               }}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
              <Upload className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
              {t("member.confirm.title")}
            </h2>
            
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              {t("member.confirm.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t("member.confirm.paymentMethod")}
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#E5E7EB'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F0B90B';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
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
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t("member.confirm.payerName")} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.payer_name}
                    onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#E5E7EB'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F0B90B';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    }}
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                    {t("member.confirm.payerRef")} (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.payer_ref}
                    onChange={(e) => setFormData({ ...formData, payer_ref: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#E5E7EB'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F0B90B';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                    }}
                    placeholder="Reference number"
                  />
                </div>
              </div>

              {/* Transaction Signature (for crypto) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t("member.confirm.txSignature")} (Optional)
                </label>
                <textarea
                  value={formData.tx_signature}
                  onChange={(e) => setFormData({ ...formData, tx_signature: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none transition-all"
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#E5E7EB'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F0B90B';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                  placeholder="Transaction hash or signature"
                  rows={3}
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#E5E7EB' }}>
                  {t("member.confirm.proofUpload")} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="p-6 text-center rounded-lg border-2 border-dashed transition-colors"
                     style={{
                       borderColor: 'rgba(255,255,255,0.12)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.borderColor = 'rgba(240,185,11,0.4)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                     }}>
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
                    <Upload className="w-8 h-8" style={{ color: '#9CA3AF' }} />
                    <span style={{ color: '#E5E7EB' }}>
                      {proofFile ? proofFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-sm" style={{ color: '#9CA3AF' }}>
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
                      className="max-w-full h-auto rounded-lg"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !proofFile}
                className="w-full font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                  color: '#111827'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && !proofFile) return;
                  e.currentTarget.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
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
          <div className="p-6 rounded-lg text-center" 
               style={{
                 backgroundColor: 'rgba(59,130,246,0.1)',
                 border: '1px solid rgba(59,130,246,0.2)'
               }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#3B82F6' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E5E7EB' }}>
              {t("member.confirm.waitingReview")}
            </h3>
            <p style={{ color: '#9CA3AF' }}>
              Your payment confirmation has been submitted and is being reviewed by our team.
            </p>
          </div>
        )}

        {invoice.status === 'PAID' && (
          <div className="p-6 rounded-lg text-center" 
               style={{
                 backgroundColor: 'rgba(34,197,94,0.1)',
                 border: '1px solid rgba(34,197,94,0.2)'
               }}>
            <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#22C55E' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E5E7EB' }}>
              {t("member.confirm.alreadyPaid")}
            </h3>
            <p style={{ color: '#9CA3AF' }}>
              This invoice has been paid and confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberInvoiceDetailPage;
