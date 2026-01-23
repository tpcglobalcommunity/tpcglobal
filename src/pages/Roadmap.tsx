import { Calendar, CheckCircle2, Circle, Clock, FileText, Eye, ExternalLink } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from '../components/ui';
import { Link } from '../components/Router';

interface RoadmapProps {
  lang: Language;
}

type PhaseStatus = 'completed' | 'inProgress' | 'planned';

interface Phase {
  id: string;
  status: PhaseStatus;
  title: string;
  desc: string;
  quarter: string;
  bullets: readonly string[];
}

const Roadmap = ({ lang }: RoadmapProps) => {
  const t = useTranslations(lang);

  const phases: Phase[] = [
    {
      id: 'p1',
      status: 'completed',
      title: t.roadmap.phases.p1.title,
      desc: t.roadmap.phases.p1.desc,
      quarter: t.roadmap.phases.p1.quarter,
      bullets: t.roadmap.phases.p1.bullets,
    },
    {
      id: 'p2',
      status: 'inProgress',
      title: t.roadmap.phases.p2.title,
      desc: t.roadmap.phases.p2.desc,
      quarter: t.roadmap.phases.p2.quarter,
      bullets: t.roadmap.phases.p2.bullets,
    },
    {
      id: 'p3',
      status: 'planned',
      title: t.roadmap.phases.p3.title,
      desc: t.roadmap.phases.p3.desc,
      quarter: t.roadmap.phases.p3.quarter,
      bullets: t.roadmap.phases.p3.bullets,
    },
    {
      id: 'p4',
      status: 'planned',
      title: t.roadmap.phases.p4.title,
      desc: t.roadmap.phases.p4.desc,
      quarter: t.roadmap.phases.p4.quarter,
      bullets: t.roadmap.phases.p4.bullets,
    },
    {
      id: 'p5',
      status: 'planned',
      title: t.roadmap.phases.p5.title,
      desc: t.roadmap.phases.p5.desc,
      quarter: t.roadmap.phases.p5.quarter,
      bullets: t.roadmap.phases.p5.bullets,
    },
  ];

  const getStatusConfig = (status: PhaseStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: t.roadmap.status.completed,
          icon: CheckCircle2,
          badgeClass: 'bg-green-500/10 border-green-500/30 text-green-400',
          iconClass: 'text-green-400',
          dotClass: 'bg-green-400',
        };
      case 'inProgress':
        return {
          label: t.roadmap.status.inProgress,
          icon: Clock,
          badgeClass: 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]',
          iconClass: 'text-[#F0B90B]',
          dotClass: 'bg-[#F0B90B] animate-pulse',
        };
      case 'planned':
        return {
          label: t.roadmap.status.planned,
          icon: Circle,
          badgeClass: 'bg-white/5 border-white/20 text-white/60',
          iconClass: 'text-white/40',
          dotClass: 'bg-white/30',
        };
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <Calendar className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.roadmap.hero.badge}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.roadmap.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t.roadmap.hero.subtitle}
            </p>
          </div>

          <NoticeBox
            variant="info"
            title={t.roadmap.hero.noticeTitle}
          >
            {t.roadmap.hero.noticeDesc}
          </NoticeBox>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent mb-12" />

        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              {t.roadmap.sections.timelineTitle}
            </h2>
            <p className="text-white/70 text-base">
              {t.roadmap.sections.timelineSubtitle}
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-[#F0B90B] to-white/20" />

            <div className="space-y-8">
              {phases.map((phase, index) => {
                const statusConfig = getStatusConfig(phase.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={phase.id} className="relative">
                    <div className="hidden md:block absolute left-8 top-8 w-4 h-4 -ml-2 rounded-full border-4 border-[#0A0A0B]" style={{ backgroundColor: statusConfig.dotClass.includes('green') ? '#4ade80' : statusConfig.dotClass.includes('F0B90B') ? '#F0B90B' : 'rgba(255,255,255,0.3)' }} />

                    <PremiumCard hover={false}>
                      <div className="md:ml-12">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-5xl font-bold text-white/10">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div>
                                <h3 className="text-xl md:text-2xl font-semibold text-white mb-1">
                                  {phase.title}
                                </h3>
                                <p className="text-sm text-white/50 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {phase.quarter}
                                </p>
                              </div>
                            </div>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {phase.desc}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.badgeClass} flex-shrink-0`}>
                            <StatusIcon className={`w-4 h-4 ${statusConfig.iconClass}`} />
                            <span className="text-sm font-medium">
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {phase.bullets.map((bullet, bulletIndex) => (
                            <div
                              key={bulletIndex}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]"
                            >
                              <span className="text-[#F0B90B] text-sm flex-shrink-0 mt-0.5">→</span>
                              <span className="text-white/70 text-sm leading-relaxed">
                                {bullet}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PremiumCard>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
              {t.roadmap.sections.progressTitle}
            </h2>
            <p className="text-white/70 text-base">
              {t.roadmap.sections.progressDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PremiumCard hover={false}>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t.roadmap.progress.completedLabel}
                </h3>
                <p className="text-3xl font-bold text-green-400 mb-2">1</p>
                <p className="text-sm text-white/60">Phase 1</p>
              </div>
            </PremiumCard>

            <PremiumCard hover={false}>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-black animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t.roadmap.progress.inProgressLabel}
                </h3>
                <p className="text-3xl font-bold text-[#F0B90B] mb-2">1</p>
                <p className="text-sm text-white/60">Phase 2</p>
              </div>
            </PremiumCard>

            <PremiumCard hover={false}>
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <Circle className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t.roadmap.progress.plannedLabel}
                </h3>
                <p className="text-3xl font-bold text-white/60 mb-2">3</p>
                <p className="text-sm text-white/60">Phases 3-5</p>
              </div>
            </PremiumCard>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <PremiumCard hover={false}>
            <div className="text-center py-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                {t.roadmap.cta.title}
              </h2>
              <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
                {t.roadmap.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={getLangPath(lang, '/whitepaper')}>
                  <PremiumButton variant="primary">
                    <FileText className="w-5 h-5" />
                    {t.roadmap.cta.primary}
                  </PremiumButton>
                </Link>
                <Link to={getLangPath(lang, '/transparency')}>
                  <PremiumButton variant="secondary">
                    <Eye className="w-5 h-5" />
                    {t.roadmap.cta.secondary}
                  </PremiumButton>
                </Link>
                <PremiumButton
                  variant="secondary"
                  href="https://t.me/tpcglobalcommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t.roadmap.cta.tertiary}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
};

export default Roadmap;
