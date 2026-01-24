import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Package, FileText, Search, X, Check, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { PremiumShell } from '../../components/ui/PremiumShell';
import { PremiumCard } from '../../components/ui/PremiumCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { useI18n } from '../../i18n';
import {
  adminListUsers,
  adminSetUserRole,
  adminSetUserVerified,
  adminToggleCanInvite,
  getVendorApplicationsAdmin,
  updateVendorApplicationStatus,
  getAdminActions,
  type AdminUserListItem,
  type VendorApplication,
  type AdminAction,
} from '../../lib/supabase';
import { TrustBadges } from '../../components/trust/TrustBadges';

type TabType = 'users' | 'vendors' | 'audit';

export default function AdminControlCenterPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>('users');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
      <p className="text-white/60 text-sm mt-1">If you see this, admin page is rendering ✅</p>
      
      {/* ...lanjutan konten admin... */}
      <PremiumShell>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 backdrop-blur-sm border border-yellow-400/20">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                {t('admin.control.title')}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {t('admin.control.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-800">
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={Users}
              label={t('admin.control.tabs.users')}
            />
            <TabButton
              active={activeTab === 'vendors'}
              onClick={() => setActiveTab('vendors')}
              icon={Package}
              label={t('admin.control.tabs.vendors')}
            />
            <TabButton
              active={activeTab === 'audit'}
              onClick={() => setActiveTab('audit')}
              icon={FileText}
              label={t('admin.control.tabs.audit')}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'users' && <UsersTab key="users" />}
            {activeTab === 'vendors' && <VendorsTab key="vendors" />}
            {activeTab === 'audit' && <AuditTab key="audit" />}
          </AnimatePresence>
        </div>
      </PremiumShell>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium transition-colors ${
        active ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600"
        />
      )}
    </button>
  );
}

function UsersTab() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [canInviteFilter, setCanInviteFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageSize = 20;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminListUsers({
        query: searchQuery || undefined,
        role: roleFilter || undefined,
        verified: verifiedFilter ? verifiedFilter === 'yes' : undefined,
        can_invite: canInviteFilter ? canInviteFilter === 'yes' : undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setUsers(data);
      setTotalCount(data.length > 0 ? data[0].total_count : 0);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, verifiedFilter, canInviteFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setVerifiedFilter('');
    setCanInviteFilter('');
    setPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Username', 'Full Name', 'Role', 'Verified', 'Can Invite', 'Referral Count', 'Created'];
    const csvData = users.map(user => [
      user.email,
      user.username || '',
      user.full_name || '',
      user.role,
      user.is_verified ? 'Yes' : 'No',
      user.can_invite ? 'Yes' : 'No',
      '0',
      new Date(user.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 mb-6 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('admin.control.filters.searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
              >
                <option value="">All Roles</option>
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Verified</label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Can Invite</label>
              <select
                value={canInviteFilter}
                onChange={(e) => setCanInviteFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={exportToCSV}
              disabled={users.length === 0}
              className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin" />
          <p className="text-gray-400 mt-4">Loading users...</p>
        </div>
      ) : error ? (
        /* Error State */
        <PremiumCard className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <PremiumButton
            variant="primary"
            size="sm"
            onClick={fetchUsers}
          >
            Retry
          </PremiumButton>
        </PremiumCard>
      ) : users.length === 0 ? (
        /* Empty State */
        <PremiumCard className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No users found</p>
          <PremiumButton
            variant="secondary"
            size="sm"
            onClick={resetFilters}
          >
            Reset Filters
          </PremiumButton>
        </PremiumCard>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onManage={() => setSelectedUser(user)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {t('admin.control.pagination.showing')} {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} {t('admin.control.pagination.of')} {totalCount} {t('admin.control.pagination.users')}
              </p>
              <div className="flex gap-2">
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t('admin.control.pagination.prev')}
                </PremiumButton>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {t('admin.control.pagination.next')}
                </PremiumButton>
              </div>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <ManageUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </motion.div>
  );
}

function UserCard({ user, onManage }: { user: AdminUserListItem; onManage: () => void }) {
  const { t } = useI18n();

  return (
    <PremiumCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-yellow-400">
              {user.username?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-100 truncate">
                {user.full_name || 'No Name'}
              </h3>
              {user.username && (
                <span className="text-sm text-gray-400">@{user.username}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <TrustBadges
                role={user.role}
                is_verified={user.is_verified}
                can_invite={user.can_invite}
                vendor_status={(user.vendor_status as any) || 'none'}
                lang={'en' as any}
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{t('admin.control.user.referral')}: {user.referral_code} (0)</span>
              {user.country && <span>{user.country}</span>}
            </div>
          </div>
        </div>
        <PremiumButton
          variant="secondary"
          size="sm"
          onClick={onManage}
        >
          {t('admin.control.actions.manage')}
        </PremiumButton>
      </div>
    </PremiumCard>
  );
}

function ManageUserModal({ user, onClose, onSuccess }: { user: AdminUserListItem; onClose: () => void; onSuccess: () => void }) {
  const { t } = useI18n();
  const [role, setRole] = useState(user.role as string);
  const [verified, setVerified] = useState(user.is_verified);
  const [canInvite, setCanInvite] = useState(user.can_invite);
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const hasChanges = role !== user.role || verified !== user.is_verified || canInvite !== user.can_invite;

  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    if (confirmText !== 'CONFIRM') {
      toast(t('admin.control.modal.confirmLabel'), 'error');
      return;
    }

    setLoading(true);
    try {
      if (role !== user.role) {
        await adminSetUserRole(user.id, role as any, reason);
        toast(t('admin.control.toasts.roleChanged'));
      }
      if (verified !== user.is_verified) {
        await adminSetUserVerified(user.id, verified, reason);
        toast(t('admin.control.toasts.verifiedChanged'));
      }
      if (canInvite !== user.can_invite) {
        await adminToggleCanInvite(user.id, canInvite, reason);
        toast(t('admin.control.toasts.inviteChanged'));
      }
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast(error.message || t('admin.control.toasts.failed'), 'error');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-lg">
          <PremiumCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-100">{t('admin.control.modal.title')}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('admin.control.user.role')}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                >
                  <option value="member">{t('admin.control.filters.member')}</option>
                  <option value="moderator">{t('admin.control.filters.moderator')}</option>
                  <option value="admin">{t('admin.control.filters.admin')}</option>
                  <option value="super_admin">{t('admin.control.filters.superAdmin')}</option>
                </select>
                {role === 'super_admin' && (
                  <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('admin.control.modal.warningRole')}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-300">{t('admin.control.user.verified')}</span>
                <button
                  onClick={() => setVerified(!verified)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    verified ? 'bg-yellow-400' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      verified ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-300">{t('admin.control.user.canInvite')}</span>
                <button
                  onClick={() => setCanInvite(!canInvite)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    canInvite ? 'bg-yellow-400' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      canInvite ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('admin.control.modal.reasonLabel')}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('admin.control.modal.reasonPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none"
                />
              </div>

              {hasChanges && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('admin.control.modal.confirmAction')}
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={t('admin.control.modal.confirmPlaceholder')}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <PremiumButton
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                {t('admin.control.actions.cancel')}
              </PremiumButton>
              <PremiumButton
                onClick={handleSave}
                className="flex-1"
                disabled={loading || (hasChanges && confirmText !== 'CONFIRM')}
              >
                {loading ? t('admin.control.actions.confirming') : t('admin.control.actions.save')}
              </PremiumButton>
            </div>
          </PremiumCard>
        </div>
      </motion.div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-[60]"
          >
            <div className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border ${
              toastType === 'success'
                ? 'bg-green-500/20 border-green-400/50 text-green-100'
                : 'bg-red-500/20 border-red-400/50 text-red-100'
            }`}>
              <div className="flex items-center gap-2">
                {toastType === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{toastMessage}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VendorsTab() {
  const { t } = useI18n();
  const [vendors, setVendors] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await getVendorApplicationsAdmin(statusFilter || undefined);
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    const message = status === 'approved'
      ? t('admin.control.vendors.confirmApprove')
      : t('admin.control.vendors.confirmReject');

    if (!confirm(message)) return;

    try {
      await updateVendorApplicationStatus(id, status);
      fetchVendors();
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        >
          <option value="">{t('admin.control.filters.all')}</option>
          <option value="pending">{t('admin.control.filters.pending')}</option>
          <option value="approved">{t('admin.control.filters.approved')}</option>
          <option value="rejected">{t('admin.control.filters.rejected')}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <PremiumCard className="text-center py-12">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t('admin.control.vendors.empty')}</p>
        </PremiumCard>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => (
            <PremiumCard key={vendor.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2">{vendor.brand_name}</h3>
                  <div className="space-y-1 text-sm text-gray-400 mb-3">
                    <p><span className="text-gray-500">{t('admin.control.vendors.applicant')}:</span> @{vendor.username}</p>
                    <p><span className="text-gray-500">{t('admin.control.vendors.category')}:</span> {vendor.category}</p>
                    {vendor.website_url && (
                      <p><span className="text-gray-500">{t('admin.control.vendors.website')}:</span> {vendor.website_url}</p>
                    )}
                    {vendor.contact_telegram && (
                      <p><span className="text-gray-500">{t('admin.control.vendors.telegram')}:</span> {vendor.contact_telegram}</p>
                    )}
                  </div>
                  <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    vendor.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    vendor.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {vendor.status}
                  </div>
                </div>
                {vendor.status === 'pending' && (
                  <div className="flex gap-2">
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(vendor.id, 'approved')}
                    >
                      {t('admin.control.actions.approve')}
                    </PremiumButton>
                    <PremiumButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(vendor.id, 'rejected')}
                    >
                      {t('admin.control.actions.reject')}
                    </PremiumButton>
                  </div>
                )}
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function AuditTab() {
  const { t } = useI18n();
  const [logs, setLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await getAdminActions(50);
        setLogs(data);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <PremiumCard className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t('admin.control.audit.empty')}</p>
        </PremiumCard>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <PremiumCard key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                      {log.action_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p><span className="text-gray-500">{t('admin.control.audit.admin')}:</span> {log.admin_id.substring(0, 8)}...</p>
                    {log.target_user_id && (
                      <p><span className="text-gray-500">{t('admin.control.audit.target')}:</span> {log.target_user_id.substring(0, 8)}...</p>
                    )}
                  </div>
                  {log.details && expandedLog === log.id && (
                    <pre className="mt-3 p-3 bg-gray-900/50 rounded text-xs text-gray-400 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap"
                >
                  {expandedLog === log.id ? t('admin.control.audit.hideDetails') : t('admin.control.audit.showDetails')}
                </button>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
