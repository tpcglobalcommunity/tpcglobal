import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Eye, Edit3, CheckCircle, XCircle, Star, Calendar, User as UserIcon, AlertTriangle, Filter, Globe, Tag, Archive } from 'lucide-react';
import { Language, useI18n } from '@/i18n';
import { PremiumCard, PremiumButton } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import RoleGuard from '@/components/guards/RoleGuard';
import {
  adminListMarketplaceItems,
  adminUpdateMarketplaceItem,
  adminTogglePublished,
  adminToggleFeatured,
  adminGetMarketplaceStats,
  type MarketplaceItemWithVendor,
} from "@/lib/adminMarketplace";

interface AdminMarketplaceProps {
  lang: Language;
}

type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

const AdminMarketplace = ({ lang }: AdminMarketplaceProps) => {
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

  const nOrNull = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const [, setItems] = useState<MarketplaceItemWithVendor[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItemWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItemWithVendor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
  });

  // Edit modal state
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    category: '',
    price_from: '',
    description: '',
  });

  useEffect(() => {
    void loadItems();
    void loadStats();
  }, [filter, searchTerm]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const result = await adminListMarketplaceItems({
        status: filter,
        search: searchTerm,
        limit: 50,
      });
      
      if (result.error) {
        if (result.error.includes('401') || result.error.includes('403')) {
          setErrorMessage('Unauthorized: Admin access required');
        } else {
          setErrorMessage(`Error loading marketplace items: ${result.error}`);
        }
        setItems([]);
      } else {
        setItems(result.data || []);
        setFilteredItems(result.data || []);
      }
    } catch (err) {
      setErrorMessage('Failed to load marketplace items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await adminGetMarketplaceStats();
      if (!result.error) {
        setStats(result);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleTogglePublished = async (id: string, currentlyPublished: boolean) => {
    try {
      setActionInProgress(id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const result = await adminTogglePublished(id, !currentlyPublished);
      if (result.success) {
        setSuccessMessage(`Item ${currentlyPublished ? 'unpublished' : 'published'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadItems();
        await loadStats();
      } else {
        setErrorMessage(`Failed to update item: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to update item');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleFeatured = async (id: string, item: MarketplaceItemWithVendor) => {
    try {
      setActionInProgress(id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const currentlyFeatured = item.meta?.featured || false;
      const result = await adminToggleFeatured(id, !currentlyFeatured);
      if (result.success) {
        setSuccessMessage(`Item ${currentlyFeatured ? 'unfeatured' : 'featured'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadItems();
      } else {
        setErrorMessage(`Failed to update item: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to update item');
    } finally {
      setActionInProgress(null);
    }
  };

  const openEditModal = (item: MarketplaceItemWithVendor) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      price_from: item.price_from?.toString() || '',
      description: item.description || '',
    });
    setShowEditModal(true);
  };

  const openDetailModal = (item: MarketplaceItemWithVendor) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    setEditForm({
      title: '',
      slug: '',
      category: '',
      price_from: '',
      description: '',
    });
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    
    try {
      setActionInProgress(selectedItem.id);
      setSuccessMessage(null);
      setErrorMessage(null);
      
      const patch = {
        title: editForm.title,
        slug: editForm.slug,
        category: editForm.category,
        price_from: nOrNull(editForm.price_from) || undefined,
        description: editForm.description || undefined,
      };
      
      const result = await adminUpdateMarketplaceItem(selectedItem.id, patch);
      if (result.success) {
        setSuccessMessage('Item updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadItems();
        closeEditModal();
      } else {
        setErrorMessage(`Failed to update item: ${result.error}`);
      }
    } catch (err) {
      setErrorMessage('Failed to update item');
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            <Edit3 className="w-3 h-3" />
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
            {status}
          </span>
        );
    }
  };

  const getFeaturedBadge = (item: MarketplaceItemWithVendor) => {
    const isFeatured = item.meta?.featured || false;
    if (isFeatured) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Star className="w-3 h-3" />
          Featured
        </span>
      );
    }
    return null;
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

  const getFilterCount = (filter: FilterStatus) => {
    if (filter === 'all') return stats.total;
    return stats[filter] || 0;
  };

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allowedRoles={['admin', 'super_admin']}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-[#F0B90B]" />
                {tr("admin.marketplace.title", "Marketplace Management")}
              </h1>
              <p className="text-white/70 text-lg">
                {tr("admin.marketplace.subtitle", "Manage marketplace listings and vendors")}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PremiumCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Total Items</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-white/20" />
              </div>
            </PremiumCard>
            <PremiumCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Published</p>
                  <p className="text-2xl font-bold text-green-400">{stats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400/20" />
              </div>
            </PremiumCard>
            <PremiumCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Draft</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.draft}</p>
                </div>
                <Edit3 className="w-8 h-8 text-yellow-400/20" />
              </div>
            </PremiumCard>
            <PremiumCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">Archived</p>
                  <p className="text-2xl font-bold text-gray-400">{stats.archived}</p>
                </div>
                <Archive className="w-8 h-8 text-gray-400/20" />
              </div>
            </PremiumCard>
          </div>

          {/* Filters and Search */}
          <PremiumCard className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-white/40" />
                {(['all', 'published', 'draft', 'archived'] as FilterStatus[]).map((status) => (
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
                      ? tr("admin.marketplace.filter.all", "All") 
                      : status === 'published'
                        ? tr("admin.marketplace.filter.published", "Published")
                        : status === 'draft'
                          ? tr("admin.marketplace.filter.draft", "Draft")
                          : tr("admin.marketplace.filter.archived", "Archived")
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
                    placeholder={tr("admin.marketplace.searchPlaceholder", "Search by title, slug, category, or ID...")}
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
          ) : filteredItems.length === 0 ? (
            <PremiumCard className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {tr("admin.marketplace.empty", "No items found")}
              </h3>
              <p className="text-white/70">
                {searchTerm 
                  ? tr("admin.marketplace.noSearchResults", "No items match your search criteria")
                  : filter === 'all' 
                    ? tr("admin.marketplace.noItems", "No marketplace items found")
                    : tr("admin.marketplace.noFilterResults", `No ${filter} items found`)
                }
              </p>
            </PremiumCard>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <PremiumCard key={item.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white mb-2 break-words">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-white/60 mb-2 flex-wrap">
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              {item.id.substring(0, 8)}...
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {item.slug}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {getStatusBadge(item.status)}
                          {getFeaturedBadge(item)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        <div className="text-white/60">
                          <span className="font-medium">Vendor:</span> {item.vendor_name}
                          {item.vendor_username && (
                            <span className="text-white/50">(@{item.vendor_username})</span>
                          )}
                        </div>
                        {item.price_from && (
                          <div className="text-white/60">
                            <span className="font-medium">Price:</span> {formatPrice(nOrNull(item.price_from), item.currency)}
                          </div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs">
                                +{item.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {item.short_desc && (
                        <p className="text-white/80 text-sm line-clamp-2 mb-4">
                          {item.short_desc}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {tr("admin.marketplace.action.view", "View")}
                      </button>
                      
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        {tr("admin.marketplace.action.edit", "Edit")}
                      </button>
                      
                      <PremiumButton
                        onClick={() => handleTogglePublished(item.id, item.status === 'published')}
                        disabled={actionInProgress === item.id}
                        size="sm"
                        className="w-full sm:w-auto"
                        variant={item.status === 'published' ? "secondary" : "primary"}
                      >
                        {actionInProgress === item.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {tr("admin.marketplace.processing", "Processing...")}
                          </>
                        ) : (
                          <>
                            {item.status === 'published' ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                {tr("admin.marketplace.action.unpublish", "Unpublish")}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                {tr("admin.marketplace.action.publish", "Publish")}
                              </>
                            )}
                          </>
                        )}
                      </PremiumButton>
                      
                      <PremiumButton
                        onClick={() => handleToggleFeatured(item.id, item)}
                        disabled={actionInProgress === item.id}
                        size="sm"
                        className="w-full sm:w-auto"
                        variant={item.meta?.featured ? "secondary" : "primary"}
                      >
                        {actionInProgress === item.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {tr("admin.marketplace.processing", "Processing...")}
                          </>
                        ) : (
                          <>
                            {item.meta?.featured ? (
                              <>
                                <XCircle className="w-4 h-4" />
                                {tr("admin.marketplace.action.unfeature", "Unfeature")}
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4" />
                                {tr("admin.marketplace.action.feature", "Feature")}
                              </>
                            )}
                          </>
                        )}
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedItem && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <PremiumCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {tr("admin.marketplace.editItem", "Edit Item")}
                    </h2>
                    <button
                      onClick={closeEditModal}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          {tr("admin.marketplace.title", "Title")}
                        </label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          {tr("admin.marketplace.slug", "Slug")}
                        </label>
                        <input
                          type="text"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          {tr("admin.marketplace.category", "Category")}
                        </label>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          {tr("admin.marketplace.price", "Price")}
                        </label>
                        <input
                          type="number"
                          value={editForm.price_from}
                          onChange={(e) => setEditForm({ ...editForm, price_from: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        {tr("admin.marketplace.description", "Description")}
                      </label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B] focus:bg-white/15 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <PremiumButton
                        onClick={handleSaveEdit}
                        disabled={actionInProgress === selectedItem.id}
                        className="flex-1"
                      >
                        {actionInProgress === selectedItem.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {tr("admin.marketplace.saving", "Saving...")}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            {tr("admin.marketplace.save", "Save")}
                          </>
                        )}
                      </PremiumButton>
                      <PremiumButton
                        variant="secondary"
                        onClick={closeEditModal}
                        disabled={actionInProgress === selectedItem.id}
                        className="flex-1"
                      >
                        {tr("admin.marketplace.cancel", "Cancel")}
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>
          )}

          {/* Detail Modal */}
          {showDetailModal && selectedItem && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <PremiumCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {tr("admin.marketplace.itemDetails", "Item Details")}
                    </h2>
                    <button
                      onClick={closeDetailModal}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {tr("admin.marketplace.basicInfo", "Basic Information")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.title", "Title")}</p>
                          <p className="text-white font-medium">{selectedItem.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.slug", "Slug")}</p>
                          <p className="text-white">{selectedItem.slug}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.category", "Category")}</p>
                          <p className="text-white">{selectedItem.category}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.price", "Price")}</p>
                          <p className="text-white">{formatPrice(nOrNull(selectedItem.price_from), selectedItem.currency)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.status", "Status")}</p>
                          <div>{getStatusBadge(selectedItem.status)}</div>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.vendor", "Vendor")}</p>
                          <p className="text-white">{selectedItem.vendor_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/50">{tr("admin.marketplace.createdDate", "Created Date")}</p>
                          <p className="text-white">{formatDate(selectedItem.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {selectedItem.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {tr("admin.marketplace.description", "Description")}
                        </h3>
                        <p className="text-white/80 whitespace-pre-wrap">{selectedItem.description}</p>
                      </div>
                    )}

                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {tr("admin.marketplace.tags", "Tags")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-white/10 text-white/70 rounded-lg text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
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

export default AdminMarketplace;
