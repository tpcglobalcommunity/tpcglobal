import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getNewsPosts, type NewsPostListItem, type NewsCategory } from '../lib/supabase';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';
import { BookOpen, TrendingUp, Rocket, Scale, Eye, Search } from 'lucide-react';

const categoryIcons: Record<NewsCategory, typeof BookOpen> = {
  education: BookOpen,
  update: TrendingUp,
  release: Rocket,
  policy: Scale,
  transparency: Eye,
};

export default function NewsPage() {
  const { t, language } = useLanguage();
  const translations = t;
  const [posts, setPosts] = useState<NewsPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    loadPosts(true);
  }, [selectedCategory]);

  const loadPosts = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      const category = selectedCategory === 'all' ? null : selectedCategory;

      const newPosts = await getNewsPosts(LIMIT, newOffset, category, true);

      if (reset) {
        setPosts(newPosts);
        setOffset(LIMIT);
      } else {
        setPosts([...posts, ...newPosts]);
        setOffset(offset + LIMIT);
      }

      setHasMore(newPosts.length === LIMIT);
    } catch (error) {
      console.error('Error loading news posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const title = language === 'en' ? post.title_en : post.title_id;
    const excerpt = language === 'en' ? post.excerpt_en : post.excerpt_id;
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
  });

  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  const categories: Array<NewsCategory | 'all'> = ['all', 'education', 'update', 'release', 'policy', 'transparency'];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <PremiumShell>
      <PremiumSection>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {translations.news.hero.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {translations.news.hero.subtitle}
          </p>

          <NoticeBox className="max-w-3xl mx-auto">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {translations.news.hero.noticeTitle}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {translations.news.hero.noticeDesc}
            </p>
          </NoticeBox>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => {
              const Icon = category === 'all' ? Search : categoryIcons[category as NewsCategory];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-full font-medium transition-all
                    flex items-center gap-2
                    ${selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {translations.news.filters[category]}
                </button>
              );
            })}
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={translations.news.search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {pinnedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Featured
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinnedPosts.map(post => (
                <NewsCard key={post.id} post={post} language={language} formatDate={formatDate} />
              ))}
            </div>
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {translations.news.empty.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {translations.news.empty.desc}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map(post => (
                <NewsCard key={post.id} post={post} language={language} formatDate={formatDate} />
              ))}
            </div>

            {hasMore && !searchQuery && (
              <div className="text-center mt-12">
                <PremiumButton
                  onClick={() => loadPosts(false)}
                  disabled={loading}
                >
                  {loading ? translations.news.loading : translations.news.loadMore}
                </PremiumButton>
              </div>
            )}
          </>
        )}
      </PremiumSection>
    </PremiumShell>
  );
}

function NewsCard({
  post,
  language,
  formatDate
}: {
  post: NewsPostListItem;
  language: string;
  formatDate: (date: string | null) => string;
}) {
  const { t: translations } = useLanguage();
  const title = language === 'en' ? post.title_en : post.title_id;
  const excerpt = language === 'en' ? post.excerpt_en : post.excerpt_id;
  const Icon = categoryIcons[post.category];

  return (
    <PremiumCard hover className="flex flex-col h-full">
      {post.cover_url && (
        <div className="w-full h-48 overflow-hidden rounded-t-xl">
          <img
            src={post.cover_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            <Icon className="w-3 h-3" />
            {translations.news.filters[post.category]}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              Featured
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(post.published_at)}
          </span>
          <a
            href={`/${language}/news/${post.slug}`}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm"
          >
            {translations.news.card.readMore} →
          </a>
        </div>
      </div>
    </PremiumCard>
  );
}
