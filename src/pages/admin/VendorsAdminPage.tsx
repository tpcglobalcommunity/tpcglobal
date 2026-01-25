import { useState, useEffect } from 'react';
import { Store, Filter, CheckCircle, XCircle, User, ExternalLink, Calendar, AlertCircle, Search, Eye, Clock, Mail, Phone } from 'lucide-react';
import { Language, useI18n } from '@/i18n';
import { PremiumCard, PremiumButton } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import RoleGuard from '@/components/guards/RoleGuard';
import {
  adminListVendorApplications,
  adminSetVendorApplicationStatus,
  type VendorApplication,
} from "@/lib/vendorApplications";

interface VendorsAdminPageProps {
  lang: Language;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const VendorsAdminPage = ({ lang }: VendorsAdminPageProps) => {
  const { t } = useI18n();

  const tr = (key: string, fallback: string) => { 
    try { 
      const v: any = (t as any)(key); 
      if (!v || v === key) return fallback; 
      return String(v); 
    } catch { 
      return fallback; 
    } 
  };

  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadApplications();
  }, [filter]);

  useEffect(() => {
    const filtered = applications.filter(app => {
      const matchesFilter = filter === 'all' || app.status === filter;
      const matchesSearch = !searchTerm || 
        app.brand_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    setFilteredApplications(filtered);
  }, [applications, filter, searchTerm]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const result = await adminListVendorApplications(filter);
      if (result.error) {
        if (result.error.includes('401') || result.error.includes('403')) {
          setErrorMessage('Unauthorized: Admin access required');
        } else {
          setErrorMessage(`Error loading applications: ${result.error}`);
        }
        setApplications([]);
      } else {
        setApplications(result.data || []);
      }
    } catch (err) {
      setErrorMessage('Failed to load vendor applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, note?: string) => {
    try {
      setActionInProgress(id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await adminSetVendorApplicationStatus(id, 'approved', note);
      if (result.success) {
        setSuccessMessage('Vendor application approved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadApplications();
        setShowDetailModal(false);
        setSelectedApplication(null);
        setAdminNote("");
      } else {
        setErrorMessage(`Failed to approve: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to approve application');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string, note?: string) => {
    try {
      setActionInProgress(id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await adminSetVendorApplicationStatus(id, 'rejected', note);
      if (result.success) {
        setSuccessMessage('Vendor application rejected successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadApplications();
        setShowDetailModal(false);
        setSelectedApplication(null);
        setAdminNote("");
      } else {
        setErrorMessage(`Failed to reject: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to reject application');
    } finally {
      setActionInProgress(null);
    }
  };

  const openDetailModal = (application: VendorApplication) => {
    setSelectedApplication(application);
    setAdminNote(application.admin_note || "");
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
    setAdminNote("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
            {status}
          </span>
        );
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

  const getStatusCount = (status: FilterStatus) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Store className="w-8 h-8 text-[#F0B90B]" />
                {tr("admin.vendors.title", "Vendor Applications")}
              </h1>
              <p className="text-white/70 text-lg">
                {tr("admin.vendors.subtitle", "Review and manage vendor applications")}
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="fixed top-4 right-4 z-50 p-4 max-w-md">
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>{successMessage}</span>
                </div>
              </div>
            </div>
          )}
          {errorMessage && (
            <div className="fixed top-4 right-4 z-50 p-4 max-w-md">
              <div className="bg-red-500/10 border-red-500/20 text-red-400 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <PremiumCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-white/40" />
                {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === status
                        ? 'bg-[#F0B90B] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {status === 'all' 
                      ? tr("admin.vendors.filter.all", "All") 
                      : tr(`admin.vendors.filter.${status}`, status.charAt(0).toUpperCase() + status.slice(1))
                    }
                    <span className="ml-2 text-xs opacity-75">({getStatusCount(status)})</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder={tr("admin.vendors.searchPlaceholder", "Search by name, email, or user ID...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15"
                  />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Loading State */}
          {loading ? (
            <PremiumCard className="p-12">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin"></div>
              </div>
            </PremiumCard>
          ) : filteredApplications.length === 0 ? (
            <PremiumCard className="p-12 text-center">
              <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {tr("admin.vendors.empty", "No applications found")}
              </h3>
              <p className="text-white/70">
                {searchTerm 
                  ? tr("admin.vendors.noSearchResults", "No applications match your search criteria")
                  : filter === 'all' 
                    ? tr("admin.vendors.noApplications", "No vendor applications have been submitted yet")
                    : tr("admin.vendors.noFilterResults", `No ${filter} applications found`)
                }
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <PremiumCard key={app.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 break-words">
                            {app.brand_name || app.display_name || 'Unnamed Vendor'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-white/60 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {app.user_id?.substring(0, 8)}...
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(app.created_at)}
                            </span>
                            {app.category && (
                              <span className="inline-block px-2 py-1 text-xs bg-white/10 text-white/70 rounded border border-white/20">
                                {app.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">{getStatusBadge(app.status)}</div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {app.description && (
                          <div>
                            <p className="text-xs font-medium text-white/50 mb-1">
                              {tr("admin.vendors.description", "Description")}
                            </p>
                            <p className="text-sm text-white/80 line-clamp-2">
                              {app.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {app.contact_email && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Mail className="w-4 h-4" />
                            <a 
                              href={`mailto:${app.contact_email}`}
                              className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                            >
                              {app.contact_email}
                            </a>
                          </div>
                        )}
                        {app.contact_whatsapp && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Phone className="w-4 h-4" />
                            <span>{app.contact_whatsapp}</span>
                          </div>
                        )}
                        {app.website && (
                          <div className="flex items-center gap-2 text-white/60">
                            <ExternalLink className="w-4 h-4" />
                            <a 
                              href={app.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                            >
                              {app.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <button
                        onClick={() => openDetailModal(app)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {tr("admin.vendors.viewDetails", "View Details")}
                      </button>
                      
                      {app.status === 'pending' && (
                        <>
                          <PremiumButton
                          onClick={() => handleApprove(app.id)}
                          disabled={actionInProgress === app.id}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {actionInProgress === app.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.vendors.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              {tr("admin.vendors.approve", "Approve")}
                            </>
                          )}
                        </PremiumButton>
                        <PremiumButton
                          variant="secondary"
                          onClick={() => handleReject(app.id)}
                          disabled={actionInProgress === app.id}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {actionInProgress === app.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.vendors.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              {tr("admin.vendors.reject", "Reject")}
                            </>
                          )}
                        </PremiumButton>
                        </>
                      )}
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedApplication && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <PremiumCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {tr("admin.vendors.applicationDetails", "Application Details")}
                    </h2>
                    <button
                      onClick={closeDetailModal}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {tr("admin.vendors.basicInfo", "Basic Information")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.vendors.brandName", "Brand Name")}</p>
                          <p className="text-white font-medium">{selectedApplication.brand_name || selectedApplication.display_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.vendors.status", "Status")}</p>
                          <div>{getStatusBadge(selectedApplication.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.vendors.userId", "User ID")}</p>
                          <p className="text-white font-mono text-sm">{selectedApplication.user_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.vendors.appliedDate", "Applied Date")}</p>
                          <p className="text-white">{formatDate(selectedApplication.created_at)}</p>
                        </div>
                        {selectedApplication.category && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.vendors.category", "Category")}</p>
                            <p className="text-white">{selectedApplication.category}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {selectedApplication.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {tr("admin.vendors.description", "Description")}
                        </h3>
                        <p className="text-white/80 whitespace-pre-wrap">{selectedApplication.description}</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {tr("admin.vendors.contactInfo", "Contact Information")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedApplication.contact_email && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.vendors.email", "Email")}</p>
                            <p className="text-white">{selectedApplication.contact_email}</p>
                          </div>
                        )}
                        {selectedApplication.contact_whatsapp && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.vendors.whatsapp", "WhatsApp")}</p>
                            <p className="text-white">{selectedApplication.contact_whatsapp}</p>
                          </div>
                        )}
                        {selectedApplication.website && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.vendors.website", "Website")}</p>
                            <a 
                              href={selectedApplication.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                            >
                              {selectedApplication.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Note */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {tr("admin.vendors.adminNote", "Admin Note")}
                      </h3>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder={tr("admin.vendors.adminNotePlaceholder", "Add notes about this application...")}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15 resize-none"
                        rows={4}
                      />
                    </div>

                    {/* Actions */}
                    {selectedApplication.status === 'pending' && (
                      <div className="flex gap-3">
                        <PremiumButton
                          onClick={() => handleApprove(selectedApplication.id, adminNote)}
                          disabled={actionInProgress === selectedApplication.id}
                          className="flex-1"
                        >
                          {actionInProgress === selectedApplication.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.vendors.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              {tr("admin.vendors.approve", "Approve")}
                            </>
                          )}
                        </PremiumButton>
                        <PremiumButton
                          variant="secondary"
                          onClick={() => handleReject(selectedApplication.id, adminNote)}
                          disabled={actionInProgress === selectedApplication.id}
                          className="flex-1"
                        >
                          {actionInProgress === selectedApplication.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.vendors.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              {tr("admin.vendors.reject", "Reject")}
                            </>
                          )}
                        </PremiumButton>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>
            </div>
          )}
        </div>
      </RoleGuard>
    </MemberGuard>
  );
};

export default VendorsAdminPage;
