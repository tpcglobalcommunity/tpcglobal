import { Wallet, ExternalLink, TrendingUp, CheckCircle2, FileText, Users } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from '../components/ui';
import { Link } from '../components/Router';

interface TransparencyProps {
  lang: Language;
}

const Transparency = ({ lang }: TransparencyProps) => {
  const t = useTranslations(lang);

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t.transparency.header.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
              {t.transparency.header.subtitle}
            </p>
          </div>

          <NoticeBox
            variant="info"
            title={t.transparency.header.noticeTitle}
          >
            {t.transparency.header.noticeBody}
          </NoticeBox>
        </div>

        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {t.transparency.wallets.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.transparency.wallets.items.map((wallet, index) => (
                <PremiumCard key={index}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {wallet.label}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {wallet.status}
                    </span>
                  </div>

                  <div className="bg-white/[0.04] rounded-lg p-3 mb-4 border border-white/10">
                    <p className="text-white/60 text-xs font-mono break-all">
                      {wallet.address}
                    </p>
                  </div>

                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {wallet.purpose}
                  </p>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-[#F0B90B]/30 text-white/70 hover:text-[#F0B90B] transition-all duration-200 text-sm font-medium">
                    <ExternalLink className="w-4 h-4" />
                    {t.transparency.walletAction}
                  </button>
                </PremiumCard>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {t.transparency.policy.title}
              </h2>
            </div>

            <PremiumCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#F0B90B]" />
                    {t.transparency.youtubeTitle}
                  </h3>
                  <div className="space-y-3">
                    {t.transparency.policy.youtube.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10"
                      >
                        <div className="w-8 h-8 bg-[#F0B90B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-[#F0B90B] font-bold text-sm">
                            {item.split('%')[0]}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">
                            {item.split('—')[1].trim()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center p-8 rounded-xl bg-gradient-to-br from-[#F0B90B]/10 to-transparent border border-[#F0B90B]/20">
                    <div className="text-4xl md:text-5xl font-bold text-[#F0B90B] mb-2">
                      100%
                    </div>
                    <p className="text-white/70 text-sm">
                      {t.transparency.revenueLabel}
                    </p>
                    <p className="text-white/50 text-xs mt-2 max-w-[24ch] mx-auto leading-relaxed">
                      {t.transparency.revenueDesc}
                    </p>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {t.transparency.updates.title}
              </h2>
            </div>

            <div className="space-y-4">
              {t.transparency.updates.items.map((update, index) => (
                <PremiumCard key={index}>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30">
                        <span className="text-[#F0B90B] font-semibold text-sm">
                          {update.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {update.title}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {update.desc}
                      </p>
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          </section>

          <section>
            <PremiumCard hover={false}>
              <div className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-[#F0B90B]" />
                  <h2 className="text-2xl md:text-3xl font-semibold text-white">
                    {t.transparency.cta.title}
                  </h2>
                </div>
                <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto">
                  {t.transparency.cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to={getLangPath(lang, '/docs')}>
                    <PremiumButton variant="primary">
                      <FileText className="w-5 h-5" />
                      {t.transparency.cta.docs}
                    </PremiumButton>
                  </Link>
                  <PremiumButton
                    variant="secondary"
                    href="https://t.me/tpcglobalcommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Users className="w-5 h-5" />
                    {t.transparency.cta.community}
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          </section>
        </div>
      </div>
    </PremiumShell>
  );
};

export default Transparency;
