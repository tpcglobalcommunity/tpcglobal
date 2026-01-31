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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="container-app section-spacing">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {t("member.title")}
              </h2>
              <p className="text-gray-300">
                Loading your invoices...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container-app section-spacing">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("member.title")}
          </h1>
          <p className="text-gray-300">
            {t("member.subtitle")}
          </p>
        </div>

        {/* Invoices Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("member.myInvoices")}
          </h2>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {t("member.noInvoices")}
              </h3>
              <p className="text-gray-400 text-sm">
                You haven't created any invoices yet.
              </p>
              <button
                onClick={() => navigate(`/${lang}/buytpc`)}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoice_no}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {invoice.invoice_no}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {t(`member.status.${invoice.status.toLowerCase()}`)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign className="w-4 h-4" />
                          <span>{invoice.tpc_amount} TPC</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span>{formatCurrency(invoice.total_usd, 'USD')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(invoice.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                      <button
                        onClick={() => handleViewInvoice(invoice.invoice_no)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
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
