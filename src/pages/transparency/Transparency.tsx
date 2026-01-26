import { useState, useEffect } from 'react';
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
  is_active: boolean;
}

const Transparency = ({ lang }: TransparencyProps) => {
  const { t } = useI18n();
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

  // Helper to shorten wallet address
  const shortenAddress = (address: string) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("transparency.title")}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            {t("transparency.subtitle")}
          </p>
        </div>

        {/* Info Card */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 mb-12">
          <NoticeBox variant="info">
            <div className="text-white/90">
              {t("transparency.description")}
            </div>
          </NoticeBox>
        </div>

        {/* Wallets Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B] to-[#C29409] rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              {t("transparency.wallets.title")}
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
                      {wallet.name || t("transparency.wallet.label")}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      wallet.is_active 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {wallet.is_active ? t("transparency.wallet.status.active") : t("transparency.wallet.status.inactive")}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                        {t("transparency.wallet.label")}
                      </p>
                      <p className="text-white font-mono text-sm break-all">
                        {shortenAddress(wallet.address)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                        {t("transparency.wallet.purpose")}
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
                        const explorerUrl = `https://solscan.io/account/${wallet.address}`;
                        window.open(explorerUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={getLangPath(lang, '/docs')}>
                <PremiumButton variant="secondary" size="sm" className="w-full sm:w-auto">
                  <FileText className="w-5 h-5 mr-2" />
                  {t("transparency.cta.docs")}
                </PremiumButton>
              </Link>
              
              <PremiumButton 
                variant="primary" 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={() => {
                  const telegramUrl = 'https://t.me/tpcglobalcommunity';
                  window.open(telegramUrl, '_blank');
                }}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                {t("transparency.cta.join")}
              </PremiumButton>
            </div>
          </div>
        </section>
      </div>
    </PremiumShell>
  );
};

export default Transparency;
