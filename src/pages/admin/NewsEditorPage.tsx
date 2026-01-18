import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n';
import {
  adminGetNewsPost,
  createNewsPost,
  updateNewsPost,
  deleteNewsPost,
  getProfile,
  type NewsCategory,
  supabase,
} from '../../lib/supabase';
import { PremiumShell, PremiumSection, PremiumButton, PremiumCard } from '../../components/ui';
import { ArrowLeft, Save, Eye, EyeOff, Trash2, Pin } from 'lucide-react';

interface NewsEditorPageProps {
  postId?: string;
}

export default function NewsEditorPage({ postId }: NewsEditorPageProps) {
  const { t, language } = useLanguage();
  const translations = t;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<NewsCategory>('update');
  const [titleEn, setTitleEn] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [titleId, setTitleId] = useState('');
  const [excerptId, setExcerptId] = useState('');
  const [contentId, setContentId] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (postId && authorized) {
      loadPost();
    }
  }, [postId, authorized]);

  useEffect(() => {
    if (!postId && titleEn && !slug) {
      generateSlug(titleEn);
    }
  }, [titleEn, postId]);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthorized(false);
        setCheckingAuth(false);
        return;
      }

      const profile = await getProfile(user.id);
      if (profile && ['moderator', 'admin', 'super_admin'].includes(profile.role)) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      setAuthorized(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const post = await adminGetNewsPost(postId);

      if (post) {
        setSlug(post.slug);
        setCategory(post.category);
        setTitleEn(post.title_en);
        setExcerptEn(post.excerpt_en);
        setContentEn(post.content_en);
        setTitleId(post.title_id);
        setExcerptId(post.excerpt_id);
        setContentId(post.content_id);
        setCoverUrl(post.cover_url || '');
        setIsPinned(post.is_pinned);
        setIsPublished(post.is_published);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      alert(translations.news.editor.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
    setSlug(generated);
  };

  const handleSave = async (publish: boolean = false) => {
    if (!slug || !titleEn || !excerptEn || !contentEn || !titleId || !excerptId || !contentId) {
      alert(translations.news.editor.fillRequired);
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const postData = {
        slug,
        category,
        title_en: titleEn,
        excerpt_en: excerptEn,
        content_en: contentEn,
        title_id: titleId,
        excerpt_id: excerptId,
        content_id: contentId,
        cover_url: coverUrl || null,
        is_pinned: isPinned,
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
        created_by: user.id,
      };

      if (postId) {
        await updateNewsPost(postId, postData);
        alert(translations.news.editor.saved);
      } else {
        const newPost = await createNewsPost(postData);
        if (newPost) {
          window.location.href = `/${language}/admin/news/${newPost.id}/edit`;
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert(translations.news.editor.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!postId) return;
    if (!confirm(translations.news.editor.confirmDelete)) return;

    try {
      await deleteNewsPost(postId);
      window.location.href = `/${language}/news`;
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(translations.news.editor.errorDeleting);
    }
  };

  const handleTogglePublish = async () => {
    if (!postId) return;

    try {
      setSaving(true);
      await updateNewsPost(postId, {
        is_published: !isPublished,
        published_at: !isPublished ? new Date().toISOString() : null,
      });
      setIsPublished(!isPublished);
      alert(isPublished ? translations.news.editor.unpublishedSuccess : translations.news.editor.publishedSuccess);
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert(translations.news.editor.errorSaving);
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth) {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  if (!authorized) {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {translations.news.admin.permissionDenied}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translations.news.admin.permissionDeniedDesc}
            </p>
            <a href={`/${language}/news`}>
              <PremiumButton>
                <ArrowLeft className="w-4 h-4" />
                {translations.news.detail.back}
              </PremiumButton>
            </a>
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  const categories: NewsCategory[] = ['education', 'update', 'release', 'policy', 'transparency'];

  return (
    <PremiumShell>
      <PremiumSection>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <a
                href={`/${language}/news`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                {translations.news.detail.back}
              </a>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {postId ? translations.news.editor.editTitle : translations.news.editor.newTitle}
              </h1>
            </div>

            <div className="flex gap-2">
              {postId && (
                <>
                  <PremiumButton
                    onClick={handleTogglePublish}
                    disabled={saving}
                    variant="secondary"
                  >
                    {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isPublished ? translations.news.editor.unpublish : translations.news.editor.publish}
                  </PremiumButton>
                  <PremiumButton
                    onClick={handleDelete}
                    variant="secondary"
                    className="!bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/20 dark:!text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    {translations.news.editor.delete}
                  </PremiumButton>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <PremiumCard>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {translations.news.editor.metadata}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.slug} *
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="my-awesome-post"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.category} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as NewsCategory)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {translations.news.filters[cat]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.coverUrl}
                    </label>
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="https://images.pexels.com/..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Pin className="w-4 h-4" />
                        {translations.news.editor.pinned}
                      </span>
                    </label>
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {translations.news.editor.englishContent}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.titleEn} *
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Enter English title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.excerptEn} *
                    </label>
                    <textarea
                      value={excerptEn}
                      onChange={(e) => setExcerptEn(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Brief summary in English"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.contentEn} *
                    </label>
                    <textarea
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Full content in English"
                    />
                  </div>
                </div>
              </PremiumCard>

              <PremiumCard>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {translations.news.editor.indonesianContent}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.titleId} *
                    </label>
                    <input
                      type="text"
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Masukkan judul Bahasa Indonesia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.excerptId} *
                    </label>
                    <textarea
                      value={excerptId}
                      onChange={(e) => setExcerptId(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Ringkasan singkat dalam Bahasa Indonesia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translations.news.editor.contentId} *
                    </label>
                    <textarea
                      value={contentId}
                      onChange={(e) => setContentId(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                      placeholder="Konten lengkap dalam Bahasa Indonesia"
                    />
                  </div>
                </div>
              </PremiumCard>

              <div className="flex gap-4">
                <PremiumButton
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  variant="secondary"
                  className="flex-1"
                >
                  <Save className="w-4 h-4" />
                  {saving ? translations.news.editor.saving : translations.news.editor.saveDraft}
                </PremiumButton>

                <PremiumButton
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4" />
                  {saving ? translations.news.editor.saving : translations.news.editor.saveAndPublish}
                </PremiumButton>
              </div>
            </div>
          )}
        </div>
      </PremiumSection>
    </PremiumShell>
  );
}
