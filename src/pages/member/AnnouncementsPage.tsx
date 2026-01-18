import { useState, useEffect } from 'react';
import { Megaphone, Filter } from 'lucide-react';
import { Language, useTranslations } from '../../i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { listAnnouncements, Announcement, AnnouncementCategory } from '../../lib/supabase';

interface AnnouncementsPageProps {
  lang: Language;
}

const CATEGORIES: (AnnouncementCategory | null)[] = [null, 'general', 'update', 'policy', 'security', 'release'];

const AnnouncementsPage = ({ lang }: AnnouncementsPageProps) => {
  const t = useTranslations(lang);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AnnouncementCategory | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const loadAnnouncements = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }

      const currentOffset = reset ? 0 : offset;
      const data = await listAnnouncements({
        includeDrafts: false,
        category: selectedCategory,
        limit: LIMIT,
        offset: currentOffset,
        pinnedFirst: true,
      });

      if (reset) {
        setAnnouncements(data);
      } else {
        setAnnouncements(prev => [...prev, ...data]);
      }

      setHasMore(data.length === LIMIT);
      setOffset(currentOffset + data.length);
    } catch (err) {
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadAnnouncements(true);
  }, [selectedCategory]);

  const handleCategoryChange = (category: AnnouncementCategory | null) => {
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadAnnouncements(false);
    }
  };

  const getCategoryLabel = (category: AnnouncementCategory | null): string => {
    if (category === null) return t.member.announcements.filterAll;
    switch (category) {
      case 'general': return t.member.announcements.filterGeneral;
      case 'update': return t.member.announcements.filterUpdate;
      case 'policy': return t.member.announcements.filterPolicy;
      case 'security': return t.member.announcements.filterSecurity;
      case 'release': return t.member.announcements.filterRelease;
      default: return category;
    }
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
              {t.member.announcements.subtitle || 'Stay updated with the latest news and important updates from TPC Global.'}
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium text-white/80">Filter by category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat || 'all'}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#F0B90B] text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
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
                        <div className="flex items-center gap-2 mb-3">
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
                          {announcement.published_at && (
                            <span className="text-xs text-white/50">
                              {new Date(announcement.published_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">
                          {announcement.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed whitespace-pre-wrap">
                          {announcement.body}
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
                    {loadingMore ? 'Loading...' : t.member.announcements.loadMore || 'Load More'}
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
