import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/i18n";
import { getMyInvoices, type MemberInvoice } from "@/lib/rpc/memberInvoices";

const MemberInvoicesPage = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<MemberInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
        return <Clock className="w-4 h-4" style={{ color: '#FACC15' }} />;
      case 'PENDING_REVIEW':
        return <AlertCircle className="w-4 h-4" style={{ color: '#F0B90B' }} />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4" style={{ color: '#22C55E' }} />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />;
      case 'EXPIRED':
        return <Clock className="w-4 h-4" style={{ color: '#6B7280' }} />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" style={{ color: '#6B7280' }} />;
      default:
        return <Clock className="w-4 h-4" style={{ color: '#6B7280' }} />;
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

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof MemberInvoice];
      let bValue: any = b[sortBy as keyof MemberInvoice];
      
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "UNPAID", label: t("member.status.UNPAID") },
    { value: "PENDING_REVIEW", label: t("member.status.PENDING_REVIEW") },
    { value: "PAID", label: t("member.status.PAID") },
    { value: "REJECTED", label: t("member.status.REJECTED") },
    { value: "EXPIRED", label: t("member.status.EXPIRED") },
    { value: "CANCELLED", label: t("member.status.CANCELLED") }
  ];

  const sortOptions = [
    { value: "created_at", label: "Date" },
    { value: "invoice_no", label: "Invoice Number" },
    { value: "tpc_amount", label: "TPC Amount" },
    { value: "total_usd", label: "USD Amount" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-2 border-t-[#F0B90B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#E5E7EB' }}>
            Loading Invoices...
          </h2>
          <p style={{ color: '#9CA3AF' }}>
            Please wait while we fetch your invoices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#F0B90B' }}>
            {t("member.invoices.title")}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            Manage and track your invoice payments
          </p>
        </div>
        
        <button
          onClick={() => navigate(`/${lang}/buytpc`)}
          className="px-6 py-2 font-medium rounded-lg transition-all"
          style={{
            background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
            color: '#111827'
          }}
        >
          Create Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-all"
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
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg focus:outline-none transition-all appearance-none"
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
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#9CA3AF' }} />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-lg focus:outline-none transition-all appearance-none"
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
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
        </div>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 rounded-lg transition-all"
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#E5E7EB'
          }}
        >
          {sortOrder === "desc" ? "↓" : "↑"}
        </button>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ backgroundColor: '#0F1624', border: '1px solid rgba(240,185,11,0.25)' }}>
            <FileText className="w-8 h-8" style={{ color: 'rgba(240,185,11,0.35)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#E5E7EB' }}>
            {t("member.invoices.emptyTitle")}
          </h3>
          <p className="text-sm mb-4" style={{ color: '#9CA3AF' }}>
            {t("member.invoices.emptySubtitle")}
          </p>
          <button
            onClick={() => navigate(`/${lang}/buytpc`)}
            className="px-6 py-2 font-medium rounded-lg transition-all"
            style={{
              background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
              color: '#111827'
            }}
          >
            {t("member.invoices.createInvoice")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.invoice_no}
              className="p-6 rounded-xl transition-all cursor-pointer hover:bg-[rgba(240,185,11,0.05)]"
              style={{
                backgroundColor: '#0F1624',
                border: '1px solid rgba(240,185,11,0.25)'
              }}
              onClick={() => navigate(`/${lang}/member/invoices/${invoice.invoice_no}`)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Invoice Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold" style={{ color: '#E5E7EB' }}>
                      {invoice.invoice_no}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/${lang}/member/invoices/${invoice.invoice_no}`);
                    }}
                    className="px-4 py-2 font-medium rounded-lg transition-all flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(180deg, #F0B90B, #D9A441)',
                      color: '#111827'
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    {t("member.invoices.view")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberInvoicesPage;
