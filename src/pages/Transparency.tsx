import { Wallet, ExternalLink, CheckCircle2, FileText } from 'lucide-react';
import { Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";
import { supabase } from "@/lib/supabase";

interface TransparencyProps {
  lang: Language;
}

interface WalletData {
  id: string;
  name: string;
  address: string;
  purpose: string;
  status: 'active' | 'inactive';
}

// Safe translation helper with fallback
const T = (key: string, fallback: string = "") => {
  try {
    const { t } = useI18n();
    const value = t(key);
    return (value && value !== key) ? value : fallback;
  } catch {
    return fallback;
  }
};

const Transparency = ({ lang }: TransparencyProps) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wallets from Supabase
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const { data, error } = await supabase
          .from('official_wallets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching wallets:', error);
          // Fallback to empty array
          setWallets([]);
        } else {
          setWallets(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        setWallets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, []);

  // Safe translations with fallbacks
  const title = T("transparency.title", "Transparency");
  const subtitle = T("transparency.subtitle", "Open, verifiable, and accountable ecosystem");
  const desc = T("transparency.desc", "TPC operates with a transparency-first principle. All official wallets, allocations, and on-chain activities are visible and auditable by the public.");
  
  const officialWalletsTitle = T("transparency.sections.officialWallets", "Official Wallets");
  const walletLabel = T("transparency.wallet.label", "Wallet");
  const walletPurpose = T("transparency.wallet.purpose", "Wallet Purpose");
  const statusActive = T("transparency.wallet.statusActive", "Active");
  const statusInactive = T("transparency.wallet.statusInactive", "Inactive");
  const walletAction = T("transparency.walletAction", "View on Explorer");
  
  const ctaTitle = T("transparency.cta.title", "Join Our Community");
  const ctaSubtitle = T("transparency.cta.subtitle", "Be part of a transparent and education-first trading community.");
  const ctaDocs = T("transparency.cta.docs", "Read Documentation");
  const ctaJoin = T("transparency.cta.join", "Join Community");

  // Helper to shorten wallet address
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-10 mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 border border-[#F0B90B]/20 mb-6">
              <FileText className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {title}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          <NoticeBox variant="info">
            <div className="text-white/90 leading-relaxed">
              {desc}
            </div>
          </NoticeBox>
        </div>

        {/* Official Wallets Section */}
        <div className="space-y-16">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {officialWalletsTitle}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0B90B]"></div>
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-12">
                <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8">
                  <Wallet className="w-12 h-12 text-[#F0B90B] mx-auto mb-4" />
                  <p className="text-white/60">No official wallets available at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <PremiumCard key={wallet.id}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {wallet.name || walletLabel}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        wallet.status === 'active' 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-gray-500/10 text-gray-400'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {wallet.status === 'active' ? statusActive : statusInactive}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                          {walletLabel}
                        </p>
                        <p className="text-white font-mono text-sm break-all">
                          {shortenAddress(wallet.address)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                          {walletPurpose}
                        </p>
                        <p className="text-white/80 text-sm">
                          {wallet.purpose || 'Official TPC wallet'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <PremiumButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Open in explorer (placeholder for actual explorer URL)
                          const explorerUrl = `https://etherscan.io/address/${wallet.address}`;
                          window.open(explorerUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {walletAction}
                      </PremiumButton>
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {ctaTitle}
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                {ctaSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={getLangPath(lang, '/docs')}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    <FileText className="w-5 h-5 mr-2" />
                    {ctaDocs}
                  </PremiumButton>
                </Link>
                
                <PremiumButton 
                  variant="primary" 
                  size="sm" 
                  className="w-full sm:w-auto"
                  onClick={() => {
                    // Open Telegram community (placeholder for actual URL)
                    const telegramUrl = 'https://t.me/tpcglobalcommunity';
                    window.open(telegramUrl, '_blank');
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {ctaJoin}
                </PremiumButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PremiumShell>
  );
};

// Import React hooks
import { useState, useEffect } from 'react';

export default Transparency;
