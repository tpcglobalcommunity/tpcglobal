import { useState, useEffect } from 'react';
import { Users, Search, MapPin, CheckCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../../i18n';
import { PremiumShell, PremiumCard } from '../../components/ui';
import MemberGuard from '../../components/guards/MemberGuard';
import { getMemberDirectory, DirectoryMemberItem } from '../../lib/supabase';

interface DirectoryPageProps {
  lang: Language;
}

const DirectoryPage = ({ lang }: DirectoryPageProps) => {
  const t = useTranslations(lang);

  const [members, setMembers] = useState<DirectoryMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 24;

  useEffect(() => {
    loadDirectory();
  }, [searchQuery, currentPage]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      const result = await getMemberDirectory({
        query: searchQuery,
        page: currentPage,
        pageSize,
      });

      setMembers(result.members);
      setTotalCount(result.total);
    } catch (err) {
      console.error('Error loading directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'moderator':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Member';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <MemberGuard lang={lang}>
      <PremiumShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#F0B90B]" />
              {t.member.directory.title}
            </h1>
            <p className="text-white/70 text-lg mb-6">
              {t.member.directory.subtitle}
            </p>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t.member.directory.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {loading && members.length === 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <PremiumCard>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                        <div className="h-3 bg-white/10 rounded w-full" />
                      </div>
                    </div>
                  </PremiumCard>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <PremiumCard>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/70 mb-2">
                  {t.member.directory.emptyTitle}
                </h3>
                <p className="text-sm text-white/50">
                  {t.member.directory.emptyDesc}
                </p>
              </div>
            </PremiumCard>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {members.map((member) => (
                  <PremiumCard key={member.username} className="hover:border-[#F0B90B]/30 transition-all">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative flex-shrink-0">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.username}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#F0B90B]/10 border-2 border-white/10 flex items-center justify-center">
                              <User className="w-8 h-8 text-[#F0B90B]" />
                            </div>
                          )}
                          {member.is_verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1a1a1a]">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-lg mb-1 truncate">
                            {member.full_name}
                          </h3>
                          <p className="text-sm text-white/60 mb-2">@{member.username}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded border ${getRoleBadgeColor(member.role)}`}>
                              {getRoleLabel(member.role)}
                            </span>
                            {member.is_verified && (
                              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                                {t.member.directory.verified}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-white/70 mb-3 line-clamp-2">
                          {member.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          {member.country && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{member.country}</span>
                            </div>
                          )}
                          <span>{t.member.directory.memberSince} {formatDate(member.created_at)}</span>
                        </div>
                        <button
                          onClick={() => window.location.href = getLangPath(lang, `/u/${member.username}`)}
                          className="px-3 py-1.5 bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 text-[#F0B90B] text-xs font-medium rounded transition-all"
                        >
                          {t.member.directory.viewProfile}
                        </button>
                      </div>
                    </div>
                  </PremiumCard>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-white/70">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default DirectoryPage;
