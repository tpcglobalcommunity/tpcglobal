import { useState, useEffect } from 'react';
import { Link } from '@/components/Router';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import { adminListVendorApplications, adminSetVendorApplicationStatus, type VendorApplication } from '@/lib/vendorApplications';
import { ArrowLeft, Building2, Clock, CheckCircle, XCircle, Loader2, Mail, ExternalLink, User } from 'lucide-react';

type Props = {
  lang: string;
};

export default function VendorReview({ lang }: Props) {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await adminListVendorApplications(statusFilter);
      if (error) {
        // Check for schema cache / table not found errors
        if (
          error.includes('Could not find the table') ||
          error.includes('schema cache') ||
          error.includes('PGRST205') ||
          error.includes('404')
        ) {
          // Treat as empty list with subtle note
          setApplications([]);
          setError('Vendor module not initialized yet.');
        } else {
          setError(error);
        }
      } else {
        setApplications(data);
      }
    } catch (err: any) {
      // Check for schema cache / table not found errors in catch
      if (
        err?.message?.includes('Could not find the table') ||
        err?.message?.includes('schema cache') ||
        err?.message?.includes('PGRST205') ||
        err?.message?.includes('404')
      ) {
        // Treat as empty list with subtle note
        setApplications([]);
        setError('Vendor module not initialized yet.');
      } else {
        setError('Failed to fetch applications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessing(applicationId);
    try {
      // Optional admin note for approval
      const adminNote = window.prompt('Add admin note (optional):');
      
      const result = await adminSetVendorApplicationStatus(applicationId, 'approved', adminNote || undefined);
      if (result.success) {
        setError(null); // Clear any existing errors
        setToast({ message: 'Vendor approved and published', type: 'success' });
        setTimeout(() => setToast(null), 3000);
        await fetchApplications(); // Refresh list
      } else {
        setError(result.error || 'Failed to approve application');
      }
    } catch (err) {
      setError('Failed to approve application');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessing(applicationId);
    try {
      // Required admin note for rejection
      const adminNote = window.prompt('Please provide a reason for rejection:');
      if (adminNote === null) {
        // User cancelled
        setProcessing(null);
        return;
      }
      
      const result = await adminSetVendorApplicationStatus(applicationId, 'rejected', adminNote);
      if (result.success) {
        setError(null); // Clear any existing errors
        setToast({ message: 'Vendor rejected', type: 'success' });
        setTimeout(() => setToast(null), 3000);
        await fetchApplications(); // Refresh list
      } else {
        setError(result.error || 'Failed to reject application');
      }
    } catch (err) {
      setError('Failed to reject application');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (!isAdmin) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-white/70 mb-6">Admin only</p>
            <Link to={`/${lang}`}>
              <PremiumButton>
                Back to Home
              </PremiumButton>
            </Link>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${lang}/admin`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Review</h1>
          <p className="text-white/70">Review and manage vendor applications</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border transition-all ${
            toast.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <p className="font-medium">{toast.message}</p>
          </div>
        )}

        {/* Filters */}
        <PremiumCard className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Pending ({applications.filter(a => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'approved'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Approved ({applications.filter(a => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'rejected'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>
        </PremiumCard>

        {/* Applications List */}
        {applications.length === 0 ? (
          <PremiumCard className="p-12 text-center">
            <Building2 className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="text-white/70">
              {statusFilter === 'all' 
                ? 'No vendor applications have been submitted yet'
                : `No ${statusFilter} applications found`
              }
            </p>
          </PremiumCard>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <PremiumCard key={application.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {application.brand_name}
                      </h3>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="flex items-center gap-4 text-white/60 text-sm mb-3">
                      <span className="capitalize">{application.category}</span>
                      <span>•</span>
                      <span>Applied {formatDate(application.created_at)}</span>
                      {application.reviewed_at && (
                        <>
                          <span>•</span>
                          <span>Reviewed {formatDate(application.reviewed_at)}</span>
                          {application.reviewed_by && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                                <User className="w-3 h-3" />
                                Reviewed by admin
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-white/70 mb-4 line-clamp-3">
                  {application.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  {application.contact_email && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Mail className="w-4 h-4" />
                      <a 
                        href={`mailto:${application.contact_email}`}
                        className="hover:text-[#F0B90B] transition-colors"
                      >
                        {application.contact_email}
                      </a>
                    </div>
                  )}
                  {application.website && (
                    <div className="flex items-center gap-2 text-white/60">
                      <ExternalLink className="w-4 h-4" />
                      <a 
                        href={application.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#F0B90B] transition-colors"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions for pending applications */}
                {application.status === 'pending' && (
                  <div className="flex gap-2">
                    <PremiumButton
                      onClick={() => handleApprove(application.id)}
                      disabled={processing === application.id}
                      className="flex-1"
                    >
                      {processing === application.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </PremiumButton>
                    <PremiumButton
                      variant="secondary"
                      onClick={() => handleReject(application.id)}
                      disabled={processing === application.id}
                      className="flex-1"
                    >
                      {processing === application.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </>
                      )}
                    </PremiumButton>
                  </div>
                )}
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </PremiumShell>
  );
}
