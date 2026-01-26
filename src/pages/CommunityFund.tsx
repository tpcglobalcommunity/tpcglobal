import { CheckCircle, Copy, ExternalLink, Wallet } from 'lucide-react';
import { useI18n } from "@/i18n";
import { PremiumShell, PremiumCard, NoticeBox, PremiumButton } from "@/components/ui";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface OfficialWallet {
  id: string;
  name: string;
  address: string;
  purpose: string;
  status: string;
  explorer_url?: string;
}


const CommunityFund = () => {
  const { t } = useI18n();
  const [supportWallet, setSupportWallet] = useState<OfficialWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSupportWallet = async () => {
      try {
        const { data, error } = await supabase
          .from('official_wallets')
          .select('*')
          .or('purpose.ilike.%support%,purpose.ilike.%fund%,name.ilike.%support%,name.ilike.%fund%')
          .eq('status', 'active')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching support wallet:', error);
        } else if (data) {
          setSupportWallet(data);
        }
      } catch (error) {
        console.error('Failed to fetch support wallet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportWallet();
  }, []);

  const copyAddress = async () => {
    if (supportWallet?.address) {
      try {
        await navigator.clipboard.writeText(supportWallet.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const usageItems = [
    t("fund.usage.items.0"),
    t("fund.usage.items.1"),
    t("fund.usage.items.2"),
    t("fund.usage.items.3")
  ];

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#C29409]/10 border border-[#F0B90B]/20 mb-6">
            <Wallet className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">
              {t("fund.badge")}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {t("fund.title")}
          </h1>
          
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            {t("fund.subtitle")}
          </p>
        </div>

        {/* Usage Card */}
        <PremiumCard className="mb-8" hover={false}>
          <h2 className="text-xl font-semibold text-white mb-6">
            {t("fund.usage.title")}
          </h2>
          <div className="space-y-4">
            {usageItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                <p className="text-white/75 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Notice Card */}
        <div className="mb-8">
          <NoticeBox variant="warning" title={t("fund.notice.title")}>
            <div className="text-white/90 leading-relaxed">
              {t("fund.notice.body")}
            </div>
          </NoticeBox>
        </div>

        {/* Support Wallet Card */}
        <PremiumCard className="mb-8" hover={false}>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("fund.wallet.title")}
          </h2>
          <p className="text-white/70 text-sm mb-6">
            {t("fund.wallet.desc")}
          </p>
          
          {loading ? (
            <div className="text-white/50 text-sm italic">
              Loading wallet information...
            </div>
          ) : supportWallet ? (
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Address</p>
                    <p className="text-white font-mono text-sm">
                      {formatAddress(supportWallet.address)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <PremiumButton 
                      variant="secondary" 
                      size="sm"
                      onClick={copyAddress}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : t("fund.wallet.copy")}
                    </PremiumButton>
                    
                    {supportWallet.explorer_url && (
                      <PremiumButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => window.open(supportWallet.explorer_url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t("fund.wallet.viewExplorer")}
                      </PremiumButton>
                    )}
                  </div>
                </div>
                
                {supportWallet.name && (
                  <div className="text-white/60 text-xs">
                    Label: {supportWallet.name}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-white/50 text-sm italic">
              {t("fund.wallet.empty")}
            </div>
          )}
        </PremiumCard>

        {/* Progress Card */}
        <PremiumCard hover={false}>
          <h2 className="text-xl font-semibold text-white mb-3">
            {t("fund.progress.title")}
          </h2>
          <p className="text-white/55 text-sm italic">
            {t("fund.progress.desc")}
          </p>
        </PremiumCard>
      </div>
    </PremiumShell>
  );
};

export default CommunityFund;
