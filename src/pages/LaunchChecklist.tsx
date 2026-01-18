import { CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumSection, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';
import { Accordion, AccordionItem } from '../components/ui/Accordion';

interface LaunchChecklistProps {
  lang: Language;
}

const LaunchChecklist = ({ lang }: LaunchChecklistProps) => {
  const t = useTranslations(lang);
  const lastUpdated = '2026-01-18';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-white/60" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-white/40" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return t.launch.status.ready;
      case 'review':
        return t.launch.status.review;
      case 'pending':
        return t.launch.status.pending;
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]';
      case 'review':
        return 'bg-white/5 border-white/20 text-white/70';
      case 'pending':
        return 'bg-white/[0.03] border-white/10 text-white/50';
      default:
        return 'bg-white/5 border-white/20 text-white/70';
    }
  };

  const countStatuses = () => {
    let ready = 0;
    let review = 0;
    let pending = 0;

    t.launch.groups.forEach((group: any) => {
      group.items.forEach((item: any) => {
        if (item.status === 'ready') ready++;
        if (item.status === 'review') review++;
        if (item.status === 'pending') pending++;
      });
    });

    return { ready, review, pending };
  };

  const statusCounts = countStatuses();

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <CheckCircle2 className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.launch.header.pill}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.launch.header.title}
            </h1>
            <p className="text-lg text-white/70 max-w-[60ch] mx-auto leading-relaxed mb-6">
              {t.launch.header.subtitle}
            </p>
            <NoticeBox variant="info">
              <div>
                <strong className="font-semibold">{t.launch.header.noticeTitle}</strong>
                <p className="mt-1 text-sm">{t.launch.header.noticeBody}</p>
              </div>
            </NoticeBox>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Link to={getLangPath(lang, '/docs')}>
              <button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all">
                {t.launch.links.docs}
              </button>
            </Link>
            <Link to={getLangPath(lang, '/transparency')}>
              <button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all">
                {t.launch.links.transparency}
              </button>
            </Link>
            <Link to={getLangPath(lang, '/legal')}>
              <button className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all">
                {t.launch.links.legal}
              </button>
            </Link>
            <a
              href="https://t.me/tpcglobalcommunity"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all inline-flex items-center justify-center gap-2"
            >
              {t.launch.links.community}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Accordion>
                {t.launch.groups.map((group: any) => (
                  <AccordionItem key={group.id} title={group.title} defaultOpen={group.id === 'routing'}>
                    <div className="space-y-3">
                      {group.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{item.label}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                                {getStatusLabel(item.status)}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-xs text-white/50 leading-relaxed">{item.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="lg:col-span-1">
              <PremiumCard hover={false} className="sticky top-24">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {t.launch.summary.title}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/20">
                    <span className="text-sm text-white/80">{t.launch.summary.readyLabel}</span>
                    <span className="text-lg font-bold text-[#F0B90B]">{statusCounts.ready}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-sm text-white/80">{t.launch.summary.reviewLabel}</span>
                    <span className="text-lg font-bold text-white/70">{statusCounts.review}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                    <span className="text-sm text-white/80">{t.launch.summary.pendingLabel}</span>
                    <span className="text-lg font-bold text-white/50">{statusCounts.pending}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50">
                    {t.launch.summary.lastUpdatedLabel}: <span className="text-white/70 font-medium">{lastUpdated}</span>
                  </p>
                </div>
              </PremiumCard>
            </div>
          </div>
        </div>
      </section>

      <PremiumSection variant="tight" isLast>
        <PremiumCard className="text-center" hover={false}>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
            {t.launch.cta.title}
          </h2>
          <p className="text-white/70 text-base max-w-[60ch] mx-auto leading-relaxed mb-6">
            {t.launch.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={getLangPath(lang, '/transparency')}>
              <PremiumButton variant="primary">
                {t.launch.cta.primary}
              </PremiumButton>
            </Link>
            <Link to={getLangPath(lang, '/legal')}>
              <PremiumButton variant="secondary">
                {t.launch.cta.secondary}
              </PremiumButton>
            </Link>
          </div>
        </PremiumCard>
      </PremiumSection>
    </PremiumShell>
  );
};

export default LaunchChecklist;
