import { Headphones, MessageCircle, Mail, ExternalLink, ShieldAlert, FileText, Scale } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { Link } from '../components/Router';
import { PremiumShell, PremiumSection, PremiumCard, NoticeBox } from '../components/ui';

interface SupportProps {
  lang: Language;
}

const Support = ({ lang }: SupportProps) => {
  const t = useTranslations(lang);

  const getChannelIcon = (label: string) => {
    if (label.toLowerCase().includes('telegram')) return MessageCircle;
    if (label.toLowerCase().includes('email')) return Mail;
    return Headphones;
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === 'active';
    const label = isActive ? t.support.badges.active : t.support.badges.comingSoon;
    const badgeClass = isActive
      ? 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]'
      : 'bg-white/5 border-white/20 text-white/50';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <PremiumShell>
      <section className="relative py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <Headphones className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.support.header.pill}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.support.header.title}
            </h1>
            <p className="text-lg text-white/70 max-w-[60ch] mx-auto leading-relaxed mb-6">
              {t.support.header.subtitle}
            </p>
            <NoticeBox variant="info">
              <div>
                <strong className="font-semibold">{t.support.header.noticeTitle}</strong>
                <p className="mt-1 text-sm">{t.support.header.noticeBody}</p>
              </div>
            </NoticeBox>
          </div>
        </div>
      </section>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">{t.support.channels.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.support.channels.items.map((channel: any, idx: number) => {
              const Icon = getChannelIcon(channel.label);
              const isActive = channel.status === 'active';
              const isExternal = channel.value.startsWith('http');

              return (
                <PremiumCard key={idx} hover={isActive}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#F0B90B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{channel.label}</h3>
                        {getStatusBadge(channel.status)}
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed mb-3">
                        {channel.desc}
                      </p>
                      {isActive && isExternal && (
                        <a
                          href={channel.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                        >
                          {channel.value}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isActive && !isExternal && (
                        <span className="text-sm font-medium text-white/80">{channel.value}</span>
                      )}
                    </div>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <PremiumCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20">
                <ShieldAlert className="w-5 h-5 text-[#F0B90B]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{t.support.reportSteps.title}</h2>
            </div>
            <div className="space-y-3">
              {t.support.reportSteps.steps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#F0B90B]">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight">
        <div className="max-w-4xl mx-auto">
          <PremiumCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
                <FileText className="w-5 h-5 text-white/60" />
              </div>
              <h2 className="text-2xl font-semibold text-white">{t.support.expectations.title}</h2>
            </div>
            <ul className="space-y-2">
              {t.support.expectations.bullets.map((bullet: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-white/70 text-sm leading-relaxed">
                  <span className="text-[#F0B90B] font-bold mt-0.5">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>
        </div>
      </PremiumSection>

      <PremiumSection variant="tight" isLast>
        <div className="max-w-4xl mx-auto">
          <PremiumCard className="text-center" hover={false}>
            <h2 className="text-2xl font-semibold text-white mb-6">
              {t.support.actions.title || 'Quick Actions'}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={getLangPath(lang, '/security')}>
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all inline-flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  {t.support.actions.security}
                </button>
              </Link>
              <Link to={getLangPath(lang, '/transparency')}>
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all inline-flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t.support.actions.transparency}
                </button>
              </Link>
              <Link to={getLangPath(lang, '/legal')}>
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#F0B90B]/30 hover:bg-white/10 text-sm font-medium text-white transition-all inline-flex items-center justify-center gap-2">
                  <Scale className="w-4 h-4" />
                  {t.support.actions.legal}
                </button>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Support;
