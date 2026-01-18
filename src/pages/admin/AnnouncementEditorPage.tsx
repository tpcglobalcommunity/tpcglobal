import { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import RoleGuard from '../../components/guards/RoleGuard';
import { getAnnouncement, upsertAnnouncement, AnnouncementCategory } from '../../lib/supabase';

interface AnnouncementEditorPageProps {
  lang: Language;
  announcementId?: string;
}

const CATEGORIES: AnnouncementCategory[] = ['general', 'update', 'policy', 'security', 'release'];

const AnnouncementEditorPage = ({ lang, announcementId }: AnnouncementEditorPageProps) => {
  const t = useTranslations(lang);
  const isEdit = !!announcementId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general' as AnnouncementCategory,
    is_pinned: false,
    is_published: true,
  });

  useEffect(() => {
    if (announcementId) {
      loadAnnouncement();
    }
  }, [announcementId]);

  const loadAnnouncement = async () => {
    if (!announcementId) return;

    try {
      setLoading(true);
      const data = await getAnnouncement(announcementId);

      if (!data) {
        setError('Announcement not found');
        return;
      }

      setFormData({
        title: data.title,
        body: data.body,
        category: data.category,
        is_pinned: data.is_pinned,
        is_published: data.is_published,
      });
    } catch (err) {
      console.error('Error loading announcement:', err);
      setError(t.admin.announcementEditor.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.body.trim()) {
      alert('Body is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await upsertAnnouncement({
        ...(announcementId && { id: announcementId }),
        title: formData.title.trim(),
        body: formData.body.trim(),
        category: formData.category,
        is_pinned: formData.is_pinned,
        is_published: formData.is_published,
      });

      window.location.href = getLangPath(lang, '/admin/announcements');
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(t.admin.announcementEditor.error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MemberGuard lang={lang}>
        <RoleGuard allow={['moderator', 'admin', 'super_admin']}>
          <PremiumShell>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
              </div>
            </div>
          </PremiumShell>
        </RoleGuard>
      </MemberGuard>
    );
  }

  if (error && isEdit) {
    return (
      <MemberGuard lang={lang}>
        <RoleGuard allow={['moderator', 'admin', 'super_admin']}>
          <PremiumShell>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
              <PremiumCard>
                <div className="text-center py-12">
                  <p className="text-white/70 mb-6">{error}</p>
                  <PremiumButton
                    variant="secondary"
                    onClick={() => window.location.href = getLangPath(lang, '/admin/announcements')}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to List
                  </PremiumButton>
                </div>
              </PremiumCard>
            </div>
          </PremiumShell>
        </RoleGuard>
      </MemberGuard>
    );
  }

  return (
    <MemberGuard lang={lang}>
      <RoleGuard allow={['moderator', 'admin', 'super_admin']}>
        <PremiumShell>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => window.location.href = getLangPath(lang, '/admin/announcements')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {isEdit ? t.admin.announcementEditor.editTitle : t.admin.announcementEditor.newTitle}
                </h1>
              </div>
            </div>

            <PremiumCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t.admin.announcementEditor.titleLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t.admin.announcementEditor.bodyLabel}
                  </label>
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all resize-y"
                    placeholder="Enter announcement content"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    {t.admin.announcementEditor.categoryLabel}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0F0F0F]">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/50"
                    />
                    <span className="text-white/80">{t.admin.announcementEditor.pinnedLabel}</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#F0B90B] focus:ring-2 focus:ring-[#F0B90B]/50"
                    />
                    <span className="text-white/80">{t.admin.announcementEditor.publishedLabel}</span>
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <PremiumButton
                    type="submit"
                    disabled={saving}
                  >
                    <Save className="w-5 h-5" />
                    {saving ? t.admin.announcementEditor.saving : t.admin.announcementEditor.save}
                  </PremiumButton>
                  <PremiumButton
                    type="button"
                    variant="secondary"
                    onClick={() => window.location.href = getLangPath(lang, '/admin/announcements')}
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </form>
            </PremiumCard>
          </div>
        </PremiumShell>
      </RoleGuard>
    </MemberGuard>
  );
};

export default AnnouncementEditorPage;
