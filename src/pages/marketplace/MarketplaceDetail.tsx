import { Link } from '@/components/Router';
import { getMarketplaceItemBySlug } from '@/data/marketplace';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletStatus } from '@/lib/useWalletStatus';
import { useVendorVerifiedStatus } from '@/lib/useVendorVerifiedStatus';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import { ConnectWalletCard } from '@/components/wallet/ConnectWalletCard';
import { ArrowLeft, Star, Tag, Clock, Users, Lock, Shield, Wallet } from 'lucide-react';
import { useEffect } from 'react';

// Legacy slug mapping for backward compatibility
const LEGACY_SLUG_MAP: Record<string, string> = {
  "premium-signals": "sinyal-trading-premium",
  "premium-trading-signals": "sinyal-trading-premium",
  "signals-premium": "sinyal-trading-premium",
  "market-analysis-tools": "alat-analisis-pasar",
  "market-analysis": "alat-analisis-pasar",
  "analysis-tools": "alat-analisis-pasar",
};

type Props = {
  lang: string;
  slug: string;
};

export default function MarketplaceDetail({ lang, slug }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { walletConnected, meetsRequirement } = useWalletStatus();
  const isAuthenticated = Boolean(user);
  
  // Check for legacy slug and redirect
  useEffect(() => {
    const legacySlug = LEGACY_SLUG_MAP[slug];
    if (legacySlug) {
      const newUrl = `/${lang}/marketplace/${legacySlug}`;
      window.history.replaceState({}, "", newUrl);
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
  }, [slug, lang]);
  
  const item = getMarketplaceItemBySlug(slug);
  const { isVerified: isVendorVerified } = useVendorVerifiedStatus(item);

  const isMemberOnly = item?.access === 'member';
  const isLocked = isMemberOnly && !isAuthenticated;
  const needsWallet = isMemberOnly && isAuthenticated && !walletConnected;
  const needsBalance = isMemberOnly && isAuthenticated && walletConnected && !meetsRequirement;

  // Combine static trustLevel with dynamic vendor verification
  const finalTrustLevel = isVendorVerified ? 'verified' : item?.trustLevel;

  // If item not found, show a simple not found message
  if (!item) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white/50" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('marketplace.detail.notFoundTitle')}
            </h1>
            <p className="text-white/70 mb-6">
              {t('marketplace.detail.notFoundDesc')}
            </p>
            <Link to={`/${lang}/marketplace`}>
              <PremiumButton>
                <ArrowLeft className="w-4 h-4" />
                {t('marketplace.detail.backToMarketplace')}
              </PremiumButton>
            </Link>
          </div>
        </div>
      </PremiumShell>
    );
  }

  const getCategoryLabel = (category: string) => {
    return t(`marketplace.categories.${category}`);
  };

  const getCTAText = () => {
    if (item.comingSoon) {
      return t('marketplace.status.comingSoon');
    }
    if (isLocked) {
      return 'Sign in to access';
    }
    if (needsWallet) {
      return 'Connect Wallet';
    }
    if (needsBalance) {
      return 'Need 1000+ TPC';
    }
    switch (item.category) {
      case 'education':
      case 'consulting':
        return 'Apply as Vendor';
      case 'services':
      case 'technology':
        return 'Apply as Vendor';
      default:
        return 'Apply as Vendor';
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to={`/${lang}/marketplace`}>
            <PremiumButton variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              {t('marketplace.detail.backToMarketplace')}
            </PremiumButton>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#F0B90B]/20 text-[#F0B90B] text-sm font-medium rounded">
                  {getCategoryLabel(item.category)}
                </span>
                {finalTrustLevel === 'verified' && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    VERIFIED
                  </span>
                )}
                {finalTrustLevel === 'partner' && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    PARTNER
                  </span>
                )}
                {item.badgeKeys?.map(badgeKey => (
                  <span key={badgeKey} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t(badgeKey)}
                  </span>
                ))}
                {item.comingSoon && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t('marketplace.status.comingSoon')}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                {t(item.titleKey)}
              </h1>
              
              <p className="text-white/70 text-lg leading-relaxed">
                {t(item.descKey)}
              </p>

              {/* Lock notice for member-only items */}
              {isLocked && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-medium">Members Only</p>
                      <p className="text-white/70 text-sm">Sign in to access this exclusive content</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet notice for member-only items */}
              {needsWallet && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 font-medium">Connect Wallet Required</p>
                      <p className="text-white/70 text-sm">Connect your wallet to access this service</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Balance notice for member-only items */}
              {needsBalance && (
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-medium">Insufficient Balance</p>
                      <p className="text-white/70 text-sm">You need at least 1,000 TPC tokens to access this service</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="lg:w-80">
              <PremiumCard className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-white mb-2">
                    {t('marketplace.price.from')} {t(item.currencyKey)}{item.priceAmount}
                  </div>
                  <div className="text-white/70">
                    {t(item.priceUnitKey)}
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">
                      {t('marketplace.vendor.label')}
                    </span>
                    <span className="text-white font-medium">
                      {t(item.vendorNameKey)}
                    </span>
                  </div>
                  {item.vendorSinceKey && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">
                        {t('marketplace.vendor.since')}
                      </span>
                      <span className="text-white/70">
                        {t(item.vendorSinceKey)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">
                      {t('marketplace.vendor.rating')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#F0B90B] fill-current" />
                      <span className="text-white font-medium">{item.rating}</span>
                      <span className="text-white/50 text-sm">({item.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                {isLocked ? (
                  <Link to={`/${lang}/signin`}>
                    <PremiumButton className="w-full mb-3">
                      <Lock className="w-4 h-4 mr-2" />
                      {getCTAText()}
                    </PremiumButton>
                  </Link>
                ) : needsWallet ? (
                  <div className="mb-3">
                    <PremiumButton className="w-full" disabled>
                      <Wallet className="w-4 h-4 mr-2" />
                      {getCTAText()}
                    </PremiumButton>
                    <p className="text-white/50 text-xs text-center mt-2">
                      Connect your wallet below to unlock
                    </p>
                  </div>
                ) : needsBalance ? (
                  <div className="mb-3">
                    <PremiumButton className="w-full" disabled>
                      <Wallet className="w-4 h-4 mr-2" />
                      {getCTAText()}
                    </PremiumButton>
                    <p className="text-white/50 text-xs text-center mt-2">
                      Get more TPC tokens to unlock
                    </p>
                  </div>
                ) : (
                  <Link to={`/${lang}/member/vendor/apply`}>
                    <PremiumButton 
                      className="w-full mb-3"
                      disabled={item.comingSoon}
                    >
                      {getCTAText()}
                    </PremiumButton>
                  </Link>
                )}

                <Link to={`/${lang}/marketplace`}>
                  <PremiumButton variant="secondary" className="w-full">
                    {t('marketplace.actions.viewDetails')}
                  </PremiumButton>
                </Link>
              </PremiumCard>
            </div>
          </div>
        </div>

        {/* Tags and Additional Info - Only show for authenticated users or public items */}
        {!isLocked && (
          <>
            {/* Connect Wallet Card - Show for authenticated users who need wallet */}
            {needsWallet && (
              <div className="mb-8">
                <ConnectWalletCard />
              </div>
            )}

            {/* Tags */}
            {!needsWallet && !needsBalance && item.tagKeys && item.tagKeys.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#F0B90B]" />
                  {t('marketplace.tags.label')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {item.tagKeys.map(tagKey => (
                    <span
                      key={tagKey}
                      className="px-3 py-1 bg-white/10 text-white/70 text-sm rounded-full hover:bg-white/20 transition-colors"
                    >
                      #{t(tagKey)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info - Only show if user has full access */}
            {!needsWallet && !needsBalance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PremiumCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#F0B90B]" />
                    {t('marketplace.details.aboutService')}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </PremiumCard>

                <PremiumCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {t('marketplace.details.features')}
                  </h3>
                  <ul className="space-y-2">
                    {item.tagKeys?.slice(0, 5).map(tagKey => (
                      <li key={tagKey} className="flex items-center gap-2 text-white/70">
                        <Star className="w-4 h-4 text-[#F0B90B]" />
                        {t(tagKey)}
                      </li>
                    ))}
                  </ul>
                </PremiumCard>
              </div>
            )}
          </>
        )}
      </div>
    </PremiumShell>
  );
}
