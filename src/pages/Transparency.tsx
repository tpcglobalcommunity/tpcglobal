import { Wallet, ExternalLink, TrendingDown, TrendingUp, Copy } from 'lucide-react';
import { Language, useTranslations } from '../i18n';
import { PremiumShell, PremiumSection, PremiumCard } from '../components/ui';

interface TransparencyProps {
  lang: Language;
}

const Transparency = ({ lang }: TransparencyProps) => {
  const t = useTranslations(lang);

  const wallets = [
    {
      name: t.transparency.treasury,
      description: t.transparency.treasuryDesc,
      address: t.transparency.addressTBD,
      balance: t.transparency.balanceTBD,
    },
    {
      name: t.transparency.operations,
      description: t.transparency.operationsDesc,
      address: t.transparency.addressTBD,
      balance: t.transparency.balanceTBD,
    },
    {
      name: t.transparency.liquidity,
      description: t.transparency.liquidityDesc,
      address: t.transparency.addressTBD,
      balance: t.transparency.balanceTBD,
    },
  ];

  const transactions = [
    {
      date: 'TBD',
      type: t.transparency.placeholder1,
      amount: '0 USDC',
      isOutgoing: true,
    },
    {
      date: 'TBD',
      type: t.transparency.placeholder2,
      amount: '0 USDC',
      isOutgoing: true,
    },
    {
      date: 'TBD',
      type: t.transparency.placeholder3,
      amount: '0 USDC',
      isOutgoing: false,
    },
    {
      date: 'TBD',
      type: t.transparency.placeholder4,
      amount: '0 USDC',
      isOutgoing: true,
    },
    {
      date: 'TBD',
      type: t.transparency.placeholder5,
      amount: '0 USDC',
      isOutgoing: true,
    },
  ];

  return (
    <PremiumShell>
      <PremiumSection
        title={t.transparency.title}
        subtitle={t.transparency.subtitle}
        centered
        variant="tight"
        className="!pb-6 md:!pb-8"
      >
        <p className="text-white/75 text-sm max-w-[70ch] mx-auto leading-relaxed text-center mb-12">
          {t.transparency.description}
        </p>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-6 h-6 text-[#F0B90B]" />
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {t.transparency.wallets}
            </h2>
          </div>
          <p className="text-white/55 text-sm mb-8 italic">
            {t.transparency.walletsNote}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wallets.map((wallet, index) => (
              <PremiumCard key={index}>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {wallet.name}
                </h3>
                <p className="text-white/75 text-sm mb-4 leading-relaxed">
                  {wallet.description}
                </p>
                <div className="bg-white/[0.04] rounded-lg p-3 mb-3 border border-white/10">
                  <p className="text-white/80 text-xs font-mono break-all">
                    {wallet.address}
                  </p>
                  <button className="mt-2 text-white/55 hover:text-[#F0B90B] transition-colors text-xs flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#F0B90B] font-semibold text-lg">
                    {wallet.balance}
                  </span>
                  <button className="text-white/55 hover:text-[#F0B90B] transition-colors p-2 rounded-lg hover:bg-white/[0.05]">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </PremiumCard>
            ))}
          </div>
        </div>

        <PremiumCard hover={false}>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {t.transparency.recentTransactions}
          </h2>
          <p className="text-white/55 text-sm mb-8 italic">
            {t.transparency.sampleDataNote}
          </p>
          <div className="overflow-x-auto -mx-6 md:-mx-8">
            <div className="inline-block min-w-full px-6 md:px-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-white/55 font-medium text-xs uppercase tracking-wider">
                      {t.transparency.date}
                    </th>
                    <th className="text-left py-4 px-4 text-white/55 font-medium text-xs uppercase tracking-wider">
                      {t.transparency.txDescription}
                    </th>
                    <th className="text-right py-4 px-4 text-white/55 font-medium text-xs uppercase tracking-wider">
                      {t.transparency.amount}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr
                      key={index}
                      className={`border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.03] transition-colors ${
                        index % 2 === 0 ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-white/75 text-sm font-medium">
                        {tx.date}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {tx.isOutgoing ? (
                            <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                          <span className="text-white/80 text-sm">{tx.type}</span>
                        </div>
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-semibold text-sm ${
                          tx.isOutgoing ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <button className="text-[#F0B90B] hover:text-[#F8D568] inline-flex items-center gap-2 transition-all duration-200 font-medium text-sm">
              {t.transparency.viewOnExplorer}
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </PremiumCard>
      </PremiumSection>
    </PremiumShell>
  );
};

export default Transparency;
