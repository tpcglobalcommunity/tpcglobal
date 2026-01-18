import { useState, useEffect } from 'react';
import { FileText, User, Calendar } from 'lucide-react';
import { Language } from '../../i18n';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton } from '../../components/ui';
import { useLanguage } from '../../i18n';
import { supabase } from '../../lib/supabase';
import MemberGuard from '../../components/guards/MemberGuard';
import RoleGuard from '../../components/guards/RoleGuard';

interface AuthLogsPageProps {
  lang: Language;
}

interface LogEntry {
  id: string;
  actor_id: string;
  action: string;
  reason: string | null;
  meta: any;
  created_at: string;
  actor_email?: string;
}

const AuthLogsPage = ({ lang }: AuthLogsPageProps) => {
  const { t } = useLanguage();
  const translations = t;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          id,
          actor_id,
          action,
          reason,
          meta,
          created_at,
          profiles!actor_id (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + LIMIT - 1);

      if (error) throw error;

      const formattedLogs = (data || []).map((log: any) => ({
        id: log.id,
        actor_id: log.actor_id,
        action: log.action,
        reason: log.reason,
        meta: log.meta,
        created_at: log.created_at,
        actor_email: log.profiles?.email,
      }));

      if (offset === 0) {
        setLogs(formattedLogs);
      } else {
        setLogs(prev => [...prev, ...formattedLogs]);
      }

      setHasMore(formattedLogs.length === LIMIT);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setOffset(prev => prev + LIMIT);
    loadLogs();
  };

  return (
    <MemberGuard>
      <RoleGuard allow={['moderator', 'admin', 'super_admin']}>
        <PremiumShell>
          <PremiumSection>
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {translations.admin.authLogs.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {translations.admin.authLogs.subtitle}
                </p>
              </div>

              {loading && offset === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <PremiumCard>
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {translations.admin.authLogs.empty}
                    </p>
                  </div>
                </PremiumCard>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <PremiumCard key={log.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {log.action}
                            </span>
                            {log.actor_email && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.actor_email}
                              </span>
                            )}
                          </div>
                          {log.reason && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {translations.admin.authLogs.reason}: {log.reason}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString(
                              lang === 'en' ? 'en-US' : 'id-ID',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </PremiumCard>
                  ))}

                  {hasMore && !loading && (
                    <div className="text-center pt-4">
                      <PremiumButton onClick={loadMore} variant="secondary">
                        {translations.admin.authLogs.loadMore}
                      </PremiumButton>
                    </div>
                  )}

                  {loading && offset > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </PremiumSection>
        </PremiumShell>
      </RoleGuard>
    </MemberGuard>
  );
};

export default AuthLogsPage;
