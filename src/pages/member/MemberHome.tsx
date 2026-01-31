import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, TrendingUp, Calendar, DollarSign, Eye, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { getMyInvoices, type MemberInvoice } from "@/lib/rpc/memberInvoices";

const MemberHome = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<MemberInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      console.log("MemberHome: Loading invoices...");
      setLoading(true);
      const data = await getMyInvoices();
      console.log("MemberHome: Invoices loaded:", data.length);
      setInvoices(data);
    } catch (error: any) {
      console.error("MemberHome: Failed to load invoices:", error);
      toast.error(error.message || t("memberInvoice.toast.loadFail"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return { bg: 'rgba(250,204,21,0.1)', text: '#FACC15', border: 'rgba(250,204,21,0.2)' };
      case 'PENDING_REVIEW':
        return { bg: 'rgba(250,204,21,0.1)', text: '#F0B90B', border: 'rgba(250,204,21,0.2)' };
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <div className="w-2 h-2 rounded-full bg-yellow-400" />;
      case 'PENDING_REVIEW':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'PAID':
        return <div className="w-2 h-2 rounded-full bg-green-400" />;
      case 'REJECTED':
        return <div className="w-2 h-2 rounded-full bg-red-400" />;
      case 'EXPIRED':
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
      case 'CANCELLED':
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Calculate stats
  const stats = {
    total: invoices.length,
    unpaid: invoices.filter(i => i.status === 'UNPAID').length,
    pending: invoices.filter(i => i.status === 'PENDING_REVIEW').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalTPC: invoices.reduce((sum, i) => sum + i.tpc_amount, 0),
    totalUSD: invoices.reduce((sum, i) => sum + i.total_usd, 0)
  };

  const recentInvoices = invoices.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-2 border-t-[#F0B90B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
            Loading Dashboard...
          </h2>
          <p style={{ color: '#9CA3AF' }}>
            Please wait while we fetch your data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0B90B' }}>
          {t("member.page.title")}
        </h1>
        <p style={{ color: '#9CA3AF' }}>
          {t("member.page.subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              {stats.total}
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>Total Invoices</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              {stats.totalTPC.toLocaleString()}
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>Total TPC</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              {stats.paid}
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>Completed</p>
        </div>

        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
            <span className="text-2xl font-bold" style={{ color: '#E5E7EB' }}>
              {stats.pending}
            </span>
          </div>
          <p style={{ color: '#9CA3AF' }}>Pending</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/${lang}/buytpc`)}
              className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:bg-[rgba(240,185,11,0.05)]"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
                  <DollarSign className="w-5 h-5" style={{ color: '#F0B90B' }} />
                </div>
                <div className="text-left">
                  <p className="font-medium" style={{ color: '#E5E7EB' }}>Create New Invoice</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Buy TPC tokens</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            </button>

            <button
              onClick={() => navigate(`/${lang}/member/invoices`)}
              className="w-full flex items-center justify-between p-4 rounded-lg transition-all hover:bg-[rgba(240,185,11,0.05)]"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(240,185,11,0.15)' }}>
                  <FileText className="w-5 h-5" style={{ color: '#F0B90B' }} />
                </div>
                <div className="text-left">
                  <p className="font-medium" style={{ color: '#E5E7EB' }}>View All Invoices</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>Manage your invoices</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: '#9CA3AF' }} />
            </button>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="p-6 rounded-xl" 
             style={{
               backgroundColor: '#0F1624',
               border: '1px solid rgba(240,185,11,0.25)'
             }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#E5E7EB' }}>
            <FileText className="w-5 h-5" style={{ color: 'rgba(240,185,11,0.35)' }} />
            Recent Invoices
          </h2>
          
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(240,185,11,0.35)' }} />
              <p style={{ color: '#9CA3AF' }}>No invoices yet</p>
              <button
                onClick={() => navigate(`/${lang}/buytpc`)}
                className="mt-4 px-4 py-2 font-medium rounded-lg transition-all"
                style={{
                  background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                  color: '#111827'
                }}
              >
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.invoice_no}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[rgba(240,185,11,0.05)] transition-all cursor-pointer"
                  onClick={() => navigate(`/${lang}/member/invoices/${invoice.invoice_no}`)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="font-medium" style={{ color: '#E5E7EB' }}>
                        {invoice.invoice_no}
                      </p>
                      <p className="text-sm" style={{ color: '#9CA3AF' }}>
                        {invoice.tpc_amount} TPC
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: '#E5E7EB' }}>
                      {formatCurrency(invoice.total_usd, 'USD')}
                    </p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      {formatDate(invoice.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              
              {invoices.length > 5 && (
                <button
                  onClick={() => navigate(`/${lang}/member/invoices`)}
                  className="w-full mt-3 text-center py-2 rounded-lg transition-all hover:bg-[rgba(240,185,11,0.05)]"
                  style={{ color: '#F0B90B' }}
                >
                  View All Invoices →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberHome;
