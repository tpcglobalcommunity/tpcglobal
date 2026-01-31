import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { getMyInvoices, type MemberInvoice } from "@/lib/rpc/memberInvoices";

const MemberDashboardPage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<MemberInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getMyInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error("Failed to load invoices:", error);
      toast.error(error.message || t("member.toast.uploadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PENDING_REVIEW':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'EXPIRED':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handleViewInvoice = (invoiceNo: string) => {
    navigate(`/${lang}/member/invoices/${invoiceNo}`);
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
                {t("member.title")}
              </h2>
              <p style={{ color: '#9CA3AF' }}>
                Loading your invoices...
              </p>
            </div>
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0B90B' }}>
            {t("member.title")}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {t("member.subtitle")}
          </p>
        </div>

        {/* Invoices Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <FileText className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            {t("member.myInvoices")}
          </h2>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: '#0F1624', border: '1px solid rgba(240,185,11,0.25)' }}>
                <FileText className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#E5E7EB' }}>
                {t("member.noInvoices")}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
                You haven't created any invoices yet.
              </p>
              <button
                onClick={() => navigate(`/${lang}/buytpc`)}
                className="mt-4 px-6 py-2 font-medium rounded-lg transition-all"
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
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoice_no}
                  className="p-6 rounded-xl transition-all"
                  style={{
                    backgroundColor: '#0F1624',
                    border: '1px solid rgba(240,185,11,0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(240,185,11,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0F1624';
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
                          {invoice.invoice_no}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1"
                              style={{
                                backgroundColor: getStatusColor(invoice.status).bg,
                                color: getStatusColor(invoice.status).text,
                                borderColor: getStatusColor(invoice.status).border
                              }}>
                          {getStatusIcon(invoice.status)}
                          {t(`member.status.${invoice.status.toLowerCase()}`)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2" style={{ color: '#9CA3AF' }}>
                          <DollarSign className="w-4 h-4" />
                          <span>{invoice.tpc_amount} TPC</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#9CA3AF' }}>
                          <span>{formatCurrency(invoice.total_usd, 'USD')}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#9CA3AF' }}>
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(invoice.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleViewInvoice(invoice.invoice_no)}
                        className="px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2"
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
                        <Eye className="w-4 h-4" />
                        {t("member.viewInvoice")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardPage;
