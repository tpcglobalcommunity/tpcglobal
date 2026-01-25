import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Eye, Shield, Calendar, Mail, User as UserIcon, AlertTriangle, Filter } from 'lucide-react';
import { Language, useI18n } from '@/i18n';
import { PremiumCard, PremiumButton } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import RoleGuard from '@/components/guards/RoleGuard';
import {
  adminListMembers,
  adminSetMemberVerified,
  type AdminMember,
} from "@/lib/adminMembers";

interface AdminMembersProps {
  lang: Language;
}

type FilterVerified = 'all' | 'verified' | 'unverified';

const AdminMembers = ({ lang }: AdminMembersProps) => {
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

  const [members, setMembers] = useState<AdminMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterVerified>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadMembers();
  }, [filter, searchTerm]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const result = await adminListMembers(filter, searchTerm);
      if (result.error) {
        if (result.error.includes('401') || result.error.includes('403')) {
          setErrorMessage('Unauthorized: Admin access required');
        } else {
          setErrorMessage(`Error loading members: ${result.error}`);
        }
        setMembers([]);
      } else {
        setMembers(result.data || []);
        setFilteredMembers(result.data || []);
      }
    } catch (err) {
      setErrorMessage('Failed to load members');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerified = async (member: AdminMember) => {
    try {
      setActionInProgress(member.id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      // Safety check: don't allow unverify admin/super_admin
      if (!member.verified && (member.role === 'admin' || member.role === 'super_admin')) {
        setErrorMessage('Admin accounts cannot be unverified');
        return;
      }
      
      const result = await adminSetMemberVerified(member.id, !member.verified);
      if (result.success) {
        setSuccessMessage(`Member ${member.verified ? 'unverified' : 'verified'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadMembers();
        if (showDetailModal && selectedMember?.id === member.id) {
          setSelectedMember({ ...member, verified: !member.verified });
        }
      } else {
        setErrorMessage(`Failed to update member: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to update member');
    } finally {
      setActionInProgress(null);
    }
  };

  const openDetailModal = (member: AdminMember) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedMember(null);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      admin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      vendor: 'bg-green-500/20 text-green-300 border-green-500/30',
      member: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
        colors[role as keyof typeof colors] || colors.member
      }`}>
        <Shield className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getVerifiedBadge = (verified: boolean) => {
    if (verified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          <XCircle className="w-3 h-3" />
          Unverified
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

  const getFilterCount = (filter: FilterVerified) => {
    if (filter === 'all') return members.length;
    return members.filter(member => 
      filter === 'verified' ? member.verified : !member.verified
    ).length;
  };

  const canToggleVerified = (member: AdminMember) => {
    // Allow toggle for non-admin users, or allow verify for anyone
    return member.role !== 'admin' && member.role !== 'super_admin' || !member.verified;
  };

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-[#F0B90B]" />
                {tr("admin.members.title", "Members Management")}
              </h1>
              <p className="text-white/70 text-lg">
                {tr("admin.members.subtitle", "Manage and monitor all member accounts")}
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
                  <AlertTriangle className="w-5 h-5" />
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
                {(['all', 'verified', 'unverified'] as FilterVerified[]).map((status) => (
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
                      ? tr("admin.members.filter.all", "All") 
                      : status === 'verified'
                        ? tr("admin.members.filter.verified", "Verified")
                        : tr("admin.members.filter.unverified", "Unverified")
                    }
                    <span className="ml-2 text-xs opacity-75">({getFilterCount(status)})</span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder={tr("admin.members.searchPlaceholder", "Search by name, email, or user ID...")}
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
          ) : filteredMembers.length === 0 ? (
            <PremiumCard className="p-12 text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {tr("admin.members.empty", "No members found")}
              </h3>
              <p className="text-white/70">
                {searchTerm 
                  ? tr("admin.members.noSearchResults", "No members match your search criteria")
                  : filter === 'all' 
                    ? tr("admin.members.noMembers", "No members found")
                    : tr("admin.members.noFilterResults", `No ${filter} members found`)
                }
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <PremiumCard key={member.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 break-words">
                            {member.full_name || member.username || '(no name)'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-white/60 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              {member.id.substring(0, 8)}...
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(member.created_at)}
                            </span>
                            {member.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {getRoleBadge(member.role)}
                          {getVerifiedBadge(member.verified)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        {member.username && (
                          <div className="text-white/60">
                            <span className="font-medium">@{member.username}</span>
                          </div>
                        )}
                        {member.referral_code && (
                          <div className="text-white/60">
                            <span className="font-medium">Referral:</span> {member.referral_code}
                          </div>
                        )}
                        {member.city && (
                          <div className="text-white/60">
                            <span className="font-medium">City:</span> {member.city}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <button
                        onClick={() => openDetailModal(member)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {tr("admin.members.action.view", "View")}
                      </button>
                      
                      {canToggleVerified(member) && (
                        <PremiumButton
                          onClick={() => handleToggleVerified(member)}
                          disabled={actionInProgress === member.id}
                          size="sm"
                          className="w-full sm:w-auto"
                          variant={member.verified ? "secondary" : "primary"}
                        >
                          {actionInProgress === member.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.members.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              {member.verified ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  {tr("admin.members.action.unverify", "Unverify")}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  {tr("admin.members.action.verify", "Verify")}
                                </>
                              )}
                            </>
                          )}
                        </PremiumButton>
                      )}
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedMember && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <PremiumCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {tr("admin.members.memberDetails", "Member Details")}
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
                        {tr("admin.members.basicInfo", "Basic Information")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.name", "Name")}</p>
                          <p className="text-white font-medium">
                            {selectedMember.full_name || selectedMember.username || '(no name)'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.email", "Email")}</p>
                          <p className="text-white">{selectedMember.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.userId", "User ID")}</p>
                          <p className="text-white font-mono text-sm">{selectedMember.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.username", "Username")}</p>
                          <p className="text-white">{selectedMember.username || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.role", "Role")}</p>
                          <div>{getRoleBadge(selectedMember.role)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.verified", "Verified")}</p>
                          <div>{getVerifiedBadge(selectedMember.verified)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.members.joinedDate", "Joined Date")}</p>
                          <p className="text-white">{formatDate(selectedMember.created_at)}</p>
                        </div>
                        {selectedMember.referral_code && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.members.referralCode", "Referral Code")}</p>
                            <p className="text-white">{selectedMember.referral_code}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {tr("admin.members.additionalInfo", "Additional Information")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedMember.phone && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.members.phone", "Phone")}</p>
                            <p className="text-white">{selectedMember.phone}</p>
                          </div>
                        )}
                        {selectedMember.telegram && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.members.telegram", "Telegram")}</p>
                            <p className="text-white">{selectedMember.telegram}</p>
                          </div>
                        )}
                        {selectedMember.city && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.members.city", "City")}</p>
                            <p className="text-white">{selectedMember.city}</p>
                          </div>
                        )}
                        {selectedMember.tpc_tier && (
                          <div>
                            <p className="text-sm text-white/50">{tr("admin.members.tier", "TPC Tier")}</p>
                            <p className="text-white">{selectedMember.tpc_tier}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canToggleVerified(selectedMember) && (
                      <div className="flex gap-3">
                        <PremiumButton
                          onClick={() => handleToggleVerified(selectedMember)}
                          disabled={actionInProgress === selectedMember.id}
                          className="flex-1"
                          variant={selectedMember.verified ? "secondary" : "primary"}
                        >
                          {actionInProgress === selectedMember.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              {tr("admin.members.processing", "Processing...")}
                            </>
                          ) : (
                            <>
                              {selectedMember.verified ? (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  {tr("admin.members.action.unverify", "Unverify")}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  {tr("admin.members.action.verify", "Verify")}
                                </>
                              )}
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

export default AdminMembers;
