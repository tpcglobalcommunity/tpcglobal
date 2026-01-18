import { useState, useEffect } from 'react';
import { Megaphone, Search, Calendar } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { getPublishedAnnouncements, Announcement } from '../../lib/supabase';

interface AnnouncementsPageProps {
  lang: Language;
}

const AnnouncementsPage = ({ lang }: AnnouncementsPageProps) => {
  const t = useTranslations(lang);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const loadAnnouncements = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const data = await getPublishedAnnouncements({
        page: currentPage,
        pageSize: PAGE_SIZE,
        query: searchQuery,
      });

      if (reset) {
        setAnnouncements(data);
      } else {
        setAnnouncements(prev => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadAnnouncements(true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadAnnouncements(false);
    }
  };

  const getTitle = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.title_id : announcement.title_en;
  };

  const getBody = (announcement: Announcement): string => {
    return lang === 'id' ? announcement.body_id : announcement.body_en;
  };

  return (
    <MemberGuard lang={lang}>
      <PremiumShell>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#F0B90B]" />
              {t.member.announcements.title}
            </h1>
            <p className="text-white/70 text-lg">
              {t.member.announcements.subtitle}
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.member.announcements.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/[0.07] transition-all"
              />
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
                  {t.member.announcements.emptyTitle}
                </h3>
                <p className="text-white/60">
                  {t.member.announcements.emptyDesc}
                </p>
              </div>
            </PremiumCard>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {announcements.map((announcement) => (
                  <PremiumCard
                    key={announcement.id}
                    className={announcement.is_pinned ? 'border-l-4 border-[#F0B90B]' : ''}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            announcement.is_pinned
                              ? 'bg-[#F0B90B]/20 text-[#F0B90B]'
                              : 'bg-white/10 text-white/70'
                          }`}>
                            {announcement.category.toUpperCase()}
                          </span>
                          {announcement.is_pinned && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-[#F0B90B] text-black rounded">
                              {t.member.announcements.pinned}
                            </span>
                          )}
                          {announcement.published_at && (
                            <span className="text-xs text-white/50 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(announcement.published_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {getTitle(announcement)}
                        </h3>
                        <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                          {getBody(announcement)}
                        </p>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <PremiumButton
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="secondary"
                  >
                    {loadingMore ? 'Loading...' : t.member.announcements.loadMore}
                  </PremiumButton>
                </div>
              )}
            </>
          )}
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default AnnouncementsPage;
