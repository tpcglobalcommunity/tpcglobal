import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, EyeOff, Pin, PinOff, Filter } from 'lucide-react';
import { Language, useI18n, getLangPath } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import RoleGuard from '../../components/guards/RoleGuard';
import { listAnnouncementsAdmin, upsertAnnouncement, deleteAnnouncement, Announcement } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AnnouncementsAdminListPageProps {
  lang: Language;
}

const AnnouncementsAdminListPage = ({ lang }: AnnouncementsAdminListPageProps) => {
  const { t } = useI18n(lang);
  const { profile } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await listAnnouncementsAdmin({ filter });
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [filter]);

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      await upsertAnnouncement({
        ...announcement,
        is_published: !announcement.is_published,
      });
      await loadAnnouncements();
    } catch (err) {
      console.error('Error toggling publish:', err);
      alert('Failed to update announcement');
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      await upsertAnnouncement({
        ...announcement,
        is_pinned: !announcement.is_pinned,
      });
      await loadAnnouncements();
    } catch (err) {
      console.error('Error toggling pin:', err);
      alert('Failed to update announcement');
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin';

    if (!canDelete) {
      alert('Only admins can delete announcements');
      return;
    }

    const confirmMsg = `${t("admin.announcements.confirmDelete", "Are you sure you want to delete this announcement?")}\n\n${lang === 'id' ? announcement.title_id : announcement.title_en}`;
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await deleteAnnouncement(announcement.id);
      await loadAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  const getTitle = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.title_id : announcement.title_en;
  };

  const getBody = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.body_id : announcement.body_en;
  };

  const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allowedRoles={['moderator', 'admin', 'super_admin']}>
        <PremiumShell>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Megaphone className="w-8 h-8 text-[#F0B90B]" />
                  {t("admin.announcements.title", "Announcements")}
                </h1>
                <p className="text-white/70">
                  {t("admin.announcements.subtitle", "Manage announcements and updates")}
                </p>
              </div>
              <PremiumButton
                onClick={() => window.location.href = getLangPath(lang, '/admin/announcements/new')}
              >
                <Plus className="w-5 h-5" />
                {t("admin.announcements.new", "New Announcement")}
              </PremiumButton>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white/80">Filter by status</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-[#F0B90B] text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {t("admin.announcements.filterAll", "All")}
                </button>
                <button
                  onClick={() => setFilter('published')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'published'
                      ? 'bg-[#F0B90B] text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {t("admin.announcements.filterPublished", "Published")}
                </button>
                <button
                  onClick={() => setFilter('draft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === 'draft'
                      ? 'bg-[#F0B90B] text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {t("admin.announcements.filterDraft", "Draft")}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
              </div>
            ) : announcements.length === 0 ? (
              <PremiumCard>
                <div className="text-center py-12">
                  <Megaphone className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No announcements found
                  </h3>
                  <p className="text-white/60 mb-6">
                    Create your first announcement to get started
                  </p>
                  <PremiumButton
                    onClick={() => window.location.href = getLangPath(lang, '/admin/announcements/new')}
                  >
                    <Plus className="w-5 h-5" />
                    {t("admin.announcements.new", "New Announcement")}
                  </PremiumButton>
                </div>
              </PremiumCard>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <PremiumCard
                    key={announcement.id}
                    className={announcement.is_pinned ? 'border-l-4 border-[#F0B90B]' : ''}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            announcement.is_pinned
                              ? 'bg-[#F0B90B]/20 text-[#F0B90B]'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {announcement.category.toUpperCase()}
                          </span>
                          {announcement.is_pinned && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-[#F0B90B] text-black rounded">
                              PINNED
                            </span>
                          )}
                          {!announcement.is_published && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-400 rounded">
                              DRAFT
                            </span>
                          )}
                          {announcement.published_at && (
                            <span className="text-xs text-white/50">
                              {new Date(announcement.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2 break-words">
                          {getTitle(announcement)}
                        </h3>
                        <p className="text-white/60 text-sm line-clamp-2 break-words">
                          {getBody(announcement)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => window.location.href = getLangPath(lang, `/admin/announcements/${announcement.id}/edit`)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          title={t("admin.announcements.actionsEdit", "Edit")}
                        >
                          <Edit className="w-4 h-4 text-white/70" />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(announcement)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          title={announcement.is_published ? t("admin.announcements.actionsUnpublish", "Unpublish") : t("admin.announcements.actionsPublish", "Publish")}
                        >
                          {announcement.is_published ? (
                            <EyeOff className="w-4 h-4 text-white/70" />
                          ) : (
                            <Eye className="w-4 h-4 text-white/70" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePin(announcement)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          title={announcement.is_pinned ? t("admin.announcements.actionsUnpin", "Unpin") : t("admin.announcements.actionsPin", "Pin")}
                        >
                          {announcement.is_pinned ? (
                            <PinOff className="w-4 h-4 text-white/70" />
                          ) : (
                            <Pin className="w-4 h-4 text-white/70" />
                          )}
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(announcement)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                            title={t("admin.announcements.actionsDelete", "Delete")}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </div>
        </PremiumShell>
      </RoleGuard>
    </MemberGuard>
  );
};

export default AnnouncementsAdminListPage;
