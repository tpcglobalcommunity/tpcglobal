import { useState, useEffect } from 'react';
import { Store, Filter, CheckCircle, XCircle, User, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { Language, useI18n } from '@/i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import RoleGuard from '@/components/guards/RoleGuard';
import { getVendorApplicationsAdmin, updateVendorApplicationStatus, VendorApplication } from '@/lib/supabase';

interface VendorsAdminPageProps {
  lang: Language;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const VendorsAdminPage = ({ lang }: VendorsAdminPageProps) => {
  const { t } = useI18n(lang);

  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    brand_name: string;
    action: 'approved' | 'rejected';
  } | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filter));
    }
  }, [filter, applications]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getVendorApplicationsAdmin();
      setApplications(data);
    } catch (err) {
      console.error('Error loading vendor applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setActionInProgress(applicationId);
      const success = await updateVendorApplicationStatus(applicationId, status);

      if (success) {
        await loadApplications();
        setConfirmAction(null);
      }
    } catch (err) {
      console.error('Error updating vendor application:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <PremiumShell>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
                <Store className="w-8 h-8 text-[#F0B90B]" />
                {t("admin.vendors.title", "Vendor Applications")}
              </h1>
              <p className="text-white/70 text-lg">
                {t("admin.vendors.subtitle", "Manage and review vendor applications")}
              </p>
            </div>

            <div className="mb-6 flex items-center gap-2 flex-wrap">
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
                  {status === 'all' ? t("admin.vendors.filter.all", "All") : t("admin.vendors.filter." + status, status)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <PremiumCard>
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/70">{t("admin.vendors.empty", "No applications found")}</p>
                </div>
              </PremiumCard>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <PremiumCard key={app.id}>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{app.brand_name}</h3>
                            <div className="flex items-center gap-3 text-sm text-white/60 mb-2">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                @{app.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(app.created_at)}
                              </span>
                            </div>
                            <span className="inline-block px-2 py-1 text-xs bg-white/10 text-white/70 rounded border border-white/20">
                              {app.category.charAt(0).toUpperCase() + app.category.slice(1)}
                            </span>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        <div className="space-y-3 mb-4">
                          <div>
                            <p className="text-xs font-medium text-white/50 mb-1">Description (EN)</p>
                            <p className="text-sm text-white/80 line-clamp-2">{app.description_en}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white/50 mb-1">Deskripsi (ID)</p>
                            <p className="text-sm text-white/80 line-clamp-2">{app.description_id}</p>
                          </div>
                        </div>

                        {(app.website_url || app.contact_telegram || app.contact_email) && (
                          <div className="flex flex-wrap gap-3 text-sm">
                            {app.website_url && (
                              <a
                                href={app.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Website
                              </a>
                            )}
                            {app.contact_telegram && (
                              <span className="text-white/60">Telegram: {app.contact_telegram}</span>
                            )}
                            {app.contact_email && (
                              <span className="text-white/60">Email: {app.contact_email}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {app.status === 'pending' && (
                        <div className="flex md:flex-col gap-2">
                          <PremiumButton
                            onClick={() => setConfirmAction({ id: app.id, brand_name: app.brand_name, action: 'approved' })}
                            disabled={actionInProgress === app.id}
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t("admin.vendors.approve", "Approve")}
                          </PremiumButton>
                          <PremiumButton
                            variant="secondary"
                            onClick={() => setConfirmAction({ id: app.id, brand_name: app.brand_name, action: 'rejected' })}
                            disabled={actionInProgress === app.id}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4" />
                            {t("admin.vendors.reject", "Reject")}
                          </PremiumButton>
                        </div>
                      )}
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}

            {confirmAction && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <PremiumCard className="max-w-md w-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {t("admin.vendors.confirmTitle", "Confirm Action")}
                    </h3>
                    <p className="text-white/70 mb-6">
                      {confirmAction.action === 'approved'
                        ? `Approve "${confirmAction.brand_name}" to appear in the marketplace?`
                        : `Reject "${confirmAction.brand_name}" vendor application?`}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <PremiumButton
                        onClick={() => handleAction(confirmAction.id, confirmAction.action)}
                        disabled={actionInProgress === confirmAction.id}
                      >
                        {actionInProgress === confirmAction.id ? 'Processing...' : 'Confirm'}
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        onClick={() => setConfirmAction(null)}
                        disabled={actionInProgress === confirmAction.id}
                      >
                        Cancel
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </div>
            )}
          </div>
        </PremiumShell>
      </RoleGuard>
    </MemberGuard>
  );
};

export default VendorsAdminPage;
