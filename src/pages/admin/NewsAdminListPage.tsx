import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n';
import {
  supabase,
  getProfile,
  type NewsCategory,
} from '../../lib/supabase';
import { PremiumShell, PremiumSection, PremiumButton, PremiumCard, NoticeBox } from '../../components/ui';
import { Plus, Edit, Eye, EyeOff, Pin, PinOff, Trash2, Search } from 'lucide-react';

interface NewsPost {
  id: string;
  slug: string;
  category: NewsCategory;
  title_en: string;
  title_id: string;
  is_published: boolean;
  is_pinned: boolean;
  updated_at: string;
  tags: string[];
}

export default function NewsAdminListPage() {
  const { t, language } = useLanguage();
  const translations = t;
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NewsCategory | 'all'>('all');
  const [pinnedFilter, setPinnedFilter] = useState<'all' | 'pinned'>('all');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (authorized) {
      loadPosts();
    }
  }, [authorized, statusFilter, categoryFilter, pinnedFilter]);

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
        setUserRole(profile.role);
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

  const loadPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('news_posts')
        .select('id, slug, category, title_en, title_id, is_published, is_pinned, updated_at, tags')
        .order('updated_at', { ascending: false });

      if (statusFilter === 'published') {
        query = query.eq('is_published', true);
      } else if (statusFilter === 'draft') {
        query = query.eq('is_published', false);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (pinnedFilter === 'pinned') {
        query = query.eq('is_pinned', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (post: NewsPost) => {
    try {
      const { error } = await supabase
        .from('news_posts')
        .update({
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq('id', post.id);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert(translations.news.editor.errorSaving);
    }
  };

  const handleTogglePin = async (post: NewsPost) => {
    try {
      const { error } = await supabase
        .from('news_posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', post.id);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert(translations.news.editor.errorSaving);
    }
  };

  const handleDelete = async (post: NewsPost) => {
    if (!['admin', 'super_admin'].includes(userRole)) {
      alert(translations.news.admin.permissionDenied);
      return;
    }

    if (!confirm(`${translations.news.adminList.confirmDeleteTitle}\n\n${translations.news.adminList.confirmDeleteDesc}`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      alert(translations.news.adminList.deleted);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(translations.news.adminList.deleteError);
    }
  };

  const filteredPosts = posts.filter(post => {
    const title = language === 'en' ? post.title_en : post.title_id;
    const searchLower = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(searchLower) ||
      post.slug.toLowerCase().includes(searchLower)
    );
  });

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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {translations.news.adminList.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {translations.news.adminList.subtitle}
            </p>
          </div>

          <NoticeBox
            title={translations.news.adminList.noticeTitle}
            description={translations.news.adminList.noticeDesc}
            className="mb-6"
          />

          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translations.news.adminList.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{translations.news.adminList.statusAll}</option>
              <option value="published">{translations.news.adminList.statusPublished}</option>
              <option value="draft">{translations.news.adminList.statusDraft}</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{translations.news.filters.all}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {translations.news.filters[cat]}
                </option>
              ))}
            </select>

            <select
              value={pinnedFilter}
              onChange={(e) => setPinnedFilter(e.target.value as any)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{translations.news.adminList.pinnedAll}</option>
              <option value="pinned">{translations.news.adminList.pinnedOnly}</option>
            </select>

            <a href={`/${language}/admin/news/new`}>
              <PremiumButton>
                <Plus className="w-4 h-4" />
                {translations.news.adminList.newPost}
              </PremiumButton>
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <PremiumCard>
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {translations.news.adminList.noResults}
                </p>
              </div>
            </PremiumCard>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const title = language === 'en' ? post.title_en : post.title_id;
                return (
                  <PremiumCard key={post.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              post.is_published
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {post.is_published
                              ? translations.news.adminList.published
                              : translations.news.adminList.draft}
                          </span>
                          {post.is_pinned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                              <Pin className="w-3 h-3 mr-1" />
                              {translations.news.adminList.pinned}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            {translations.news.filters[post.category]}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {translations.news.adminList.slugLabel}: {post.slug}
                          </span>
                          <span>
                            {translations.news.adminList.updatedLabel}:{' '}
                            {new Date(post.updated_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={`/${language}/admin/news/${post.id}/edit`}>
                          <PremiumButton variant="secondary" className="text-sm px-3 py-1.5">
                            <Edit className="w-4 h-4" />
                            {translations.news.adminList.actionEdit}
                          </PremiumButton>
                        </a>

                        <PremiumButton
                          onClick={() => handleTogglePublish(post)}
                          variant="secondary"
                          className="text-sm px-3 py-1.5"
                          title={translations.news.adminList.actionTogglePublish}
                        >
                          {post.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </PremiumButton>

                        <PremiumButton
                          onClick={() => handleTogglePin(post)}
                          variant="secondary"
                          className="text-sm px-3 py-1.5"
                          title={translations.news.adminList.actionTogglePin}
                        >
                          {post.is_pinned ? (
                            <PinOff className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </PremiumButton>

                        {['admin', 'super_admin'].includes(userRole) && (
                          <PremiumButton
                            onClick={() => handleDelete(post)}
                            variant="secondary"
                            className="text-sm px-3 py-1.5 !bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/20 dark:!text-red-400"
                            title={translations.news.adminList.actionDelete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </PremiumButton>
                        )}
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          )}
        </div>
      </PremiumSection>
    </PremiumShell>
  );
}
