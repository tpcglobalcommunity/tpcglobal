import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n';
import { getNewsPostBySlug, type NewsPostDetail } from '../lib/supabase';
import { PremiumShell, PremiumSection, PremiumButton } from '../components/ui';
import { ArrowLeft, Calendar, Tag, ExternalLink } from 'lucide-react';

interface NewsDetailPageProps {
  slug: string;
}

export default function NewsDetailPage({ slug }: NewsDetailPageProps) {
  const { t, language } = useLanguage();
  const [post, setPost] = useState<NewsPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getNewsPostBySlug(slug);

      if (!data) {
        setError(true);
      } else {
        setPost(data);

        const title = language === 'en' ? data.title_en : data.title_id;
        document.title = `${title} - TPC Global`;
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) {
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

  if (error || !post) {
    return (
      <PremiumShell>
        <PremiumSection>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t("news.detail.notFound", "Article not found")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t("news.detail.notFoundDesc", "The article you're looking for doesn't exist or has been removed.")}
            </p>
            <a href={`/${language}/news`}>
              <PremiumButton>
                <ArrowLeft className="w-4 h-4" />
                {t("news.detail.back", "Back to News")}
              </PremiumButton>
            </a>
          </div>
        </PremiumSection>
      </PremiumShell>
    );
  }

  const title = language === 'en' ? post.title_en : post.title_id;
  const content = language === 'en' ? post.content_en : post.content_id;

  return (
    <PremiumShell>
      <PremiumSection>
        <div className="max-w-4xl mx-auto">
          <a
            href={`/${language}/news`}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("news.detail.back", "Back to News")}
          </a>

          {post.cover_url && (
            <div className="w-full h-96 overflow-hidden rounded-2xl mb-8">
              <img
                src={post.cover_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                {t("news.filters." + post.category, post.category)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </div>
            {post.author_name && (
              <div className="flex items-center gap-2">
                <span>By {post.author_name}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            {title}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
              {content}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t("news.detail.ctaTitle", "Stay Updated")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t("news.detail.ctaDesc", "Get the latest updates and announcements from our team.")}
              </p>
              <div className="flex flex-wrap gap-4">
                <a href={`/${language}/docs`}>
                  <PremiumButton variant="primary">
                    {t("nav.docs", "Documentation")}
                  </PremiumButton>
                </a>
                <a href={`/${language}/transparency`}>
                  <PremiumButton variant="secondary">
                    {t("nav.transparency", "Transparency")}
                  </PremiumButton>
                </a>
                <a
                  href="https://t.me/tpcglobal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PremiumButton variant="secondary">
                    <ExternalLink className="w-4 h-4" />
                    {t("footer.links.telegram", "Telegram")}
                  </PremiumButton>
                </a>
              </div>
            </div>
          </div>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
}
