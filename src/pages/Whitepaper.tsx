import { FileText, Target, Users, Coins, TrendingUp, ShoppingCart, Vote, MapPin, AlertTriangle, BookOpen, Eye, ExternalLink } from 'lucide-react';
import { Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

interface WhitepaperProps {
  lang: Language;
}

const Whitepaper = ({ lang }: WhitepaperProps) => {
  const { t } = useI18n();
  const lastUpdated = '2026-01-18';

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <FileText className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {t.whitepaper.header.pill}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.whitepaper.header.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t.whitepaper.header.subtitle}
            </p>
          </div>

          <NoticeBox
            variant="info"
            title={t.whitepaper.header.noticeTitle}
          >
            {t.whitepaper.header.noticeBody}
          </NoticeBox>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#F0B90B]/30 to-transparent mb-12" />

        <div className="max-w-5xl mx-auto space-y-12">
          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.vision.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.vision.content}
            </p>
            <div className="space-y-3">
              {t.whitepaper.vision.pillars.map((pillar: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">•</span>
                  <span className="text-white/75 text-sm leading-relaxed">
                    {pillar}
                  </span>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.what.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.what.intro}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t.whitepaper.what.model}
              </h3>
              <div className="space-y-3">
                {t.whitepaper.what.points.map((point: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/20"
                  >
                    <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-white/75 text-sm leading-relaxed">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t.whitepaper.what.notModel}
              </h3>
              <div className="space-y-3">
                {t.whitepaper.what.antiPoints.map((point: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">✗</span>
                    <span className="text-white/75 text-sm leading-relaxed font-medium">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.community.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.community.intro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.whitepaper.community.layers.map((layer: any, index: number) => (
                <div
                  key={index}
                  className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.08]"
                >
                  <h3 className="text-base font-semibold text-[#F0B90B] mb-2">
                    {layer.name}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.token.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.token.intro}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {t.whitepaper.token.purpose}
              </h3>
              <div className="space-y-3">
                {t.whitepaper.token.utilities.map((utility: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                  >
                    <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">•</span>
                    <span className="text-white/75 text-sm leading-relaxed">
                      {utility}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <NoticeBox variant="warning">
              {t.whitepaper.token.disclaimer}
            </NoticeBox>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.revenue.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.revenue.intro}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {t.whitepaper.revenue.streams.map((stream: any, index: number) => (
                <div
                  key={index}
                  className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.08]"
                >
                  <h3 className="text-base font-semibold text-[#F0B90B] mb-2">
                    {stream.name}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {stream.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/20">
              <p className="text-white/80 text-sm leading-relaxed">
                <span className="font-semibold text-[#F0B90B]">Transparency: </span>
                {t.whitepaper.revenue.transparency}
              </p>
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.buyback.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.buyback.intro}
            </p>
            <div className="space-y-3 mb-6">
              {t.whitepaper.buyback.purpose.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">•</span>
                  <span className="text-white/75 text-sm leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] mb-4">
              <p className="text-white/80 text-sm leading-relaxed">
                {t.whitepaper.buyback.process}
              </p>
            </div>
            <NoticeBox variant="warning">
              {t.whitepaper.buyback.disclaimer}
            </NoticeBox>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <Vote className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.governance.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.governance.intro}
            </p>
            <div className="space-y-3 mb-6">
              {t.whitepaper.governance.principles.map((principle: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <span className="text-[#F0B90B] text-lg flex-shrink-0 mt-0.5">•</span>
                  <span className="text-white/75 text-sm leading-relaxed">
                    {principle}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/20">
              <p className="text-white/80 text-sm leading-relaxed">
                {t.whitepaper.governance.link}
              </p>
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.roadmap.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.roadmap.intro}
            </p>
            <div className="space-y-6">
              {t.whitepaper.roadmap.phases.map((phaseData: any, index: number) => (
                <div
                  key={index}
                  className="p-5 rounded-lg bg-white/[0.03] border border-white/[0.08]"
                >
                  <h3 className="text-lg font-semibold text-[#F0B90B] mb-3">
                    {phaseData.phase}
                  </h3>
                  <ul className="space-y-2">
                    {phaseData.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <span className="text-[#F0B90B] text-sm flex-shrink-0 mt-1">→</span>
                        <span className="text-white/70 text-sm leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
              <p className="text-white/70 text-sm leading-relaxed italic">
                {t.whitepaper.roadmap.note}
              </p>
            </div>
          </PremiumCard>

          <PremiumCard hover={false}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {t.whitepaper.risks.title}
                </h2>
              </div>
            </div>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              {t.whitepaper.risks.intro}
            </p>
            <div className="space-y-3 mb-6">
              {t.whitepaper.risks.points.map((point: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                >
                  <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">!</span>
                  <span className="text-white/75 text-sm leading-relaxed">
                    {point}
                  </span>
                </div>
              ))}
            </div>
            <NoticeBox variant="warning">
              <div className="font-semibold mb-2">Important Acknowledgment:</div>
              {t.whitepaper.risks.warning}
            </NoticeBox>
          </PremiumCard>

          <div className="p-6 rounded-lg bg-white/[0.02] border border-white/10">
            <p className="text-white/60 text-sm text-center">
              {t.whitepaper.lastUpdated}: <span className="text-white/80 font-medium">{lastUpdated}</span>
            </p>
          </div>

          <PremiumCard hover={false}>
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-[#F0B90B]" />
                <h2 className="text-2xl md:text-3xl font-semibold text-white">
                  {t.whitepaper.cta.title}
                </h2>
              </div>
              <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
                {t.whitepaper.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={getLangPath(lang, '/transparency')}>
                  <PremiumButton variant="primary">
                    <Eye className="w-5 h-5" />
                    {t.whitepaper.cta.transparency}
                  </PremiumButton>
                </Link>
                <Link to={getLangPath(lang, '/docs')}>
                  <PremiumButton variant="secondary">
                    <BookOpen className="w-5 h-5" />
                    {t.whitepaper.cta.docs}
                  </PremiumButton>
                </Link>
                <PremiumButton
                  variant="secondary"
                  href="https://t.me/tpcglobalcommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t.whitepaper.cta.community}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
};

export default Whitepaper;
