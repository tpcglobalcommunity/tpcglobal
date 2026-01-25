import { useState } from 'react';
import { Link } from '@/components/Router';
import { marketplaceItems, marketplaceCategories, getFeaturedMarketplaceItems, type MarketplaceItem } from '@/data/marketplace';
import { useI18n } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletStatus } from '@/lib/useWalletStatus';
import { useVendorVerifiedStatus } from '@/lib/useVendorVerifiedStatus';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import { Star, ExternalLink, Grid, List, Lock, Shield, Wallet } from 'lucide-react';

type Props = {
  lang: string;
};

export default function MarketplaceList({ lang }: Props) {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = selectedCategory === 'all' 
    ? marketplaceItems 
    : marketplaceItems.filter(item => item.category === selectedCategory);

  const featuredItems = getFeaturedMarketplaceItems().filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const regularItems = filteredItems.filter(item => !item.featured);

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('marketplace.hero.title')}
          </h1>
          <p className="text-white/70">
            {t('marketplace.hero.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {marketplaceCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#F0B90B] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {t(`marketplace.categories.${category}`)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#F0B90B] text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#F0B90B] text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-[#F0B90B]" />
              {t('marketplace.featured.title')}
            </h2>
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {featuredItems.map(item => (
                <MarketplaceItemCard 
                  key={item.id} 
                  item={item} 
                  viewMode={viewMode} 
                  lang={lang} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Items */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">
            {selectedCategory === 'all' 
              ? (t('marketplace.allServices'))
              : (t(`marketplace.categories.${selectedCategory}`))
            }
          </h2>
          
          {regularItems.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {regularItems.map(item => (
                <MarketplaceItemCard 
                  key={item.id} 
                  item={item} 
                  viewMode={viewMode} 
                  lang={lang} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70">
                {t('marketplace.noResults')}
              </p>
              <p className="text-white/50 text-sm mt-2">
                {t('marketplace.tryDifferentCategory')}
              </p>
            </div>
          )}
        </div>
      </div>
    </PremiumShell>
  );
}

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  viewMode: 'grid' | 'list';
  lang: string;
}

function MarketplaceItemCard({ item, viewMode, lang }: MarketplaceItemCardProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { walletConnected, meetsRequirement } = useWalletStatus();
  const { isVerified: isVendorVerified } = useVendorVerifiedStatus(item);
  const isAuthenticated = Boolean(user);

  const getCategoryLabel = (category: string) => {
    return t(`marketplace.categories.${category}`);
  };

  const isMemberOnly = item.access === 'member';
  const isLocked = isMemberOnly && !isAuthenticated;
  const needsWallet = isMemberOnly && isAuthenticated && !walletConnected;
  const needsBalance = isMemberOnly && isAuthenticated && walletConnected && !meetsRequirement;
  const isDisabled = item.comingSoon;

  // Combine static trustLevel with dynamic vendor verification
  const finalTrustLevel = isVendorVerified ? 'verified' : item.trustLevel;

  const getCTAText = () => {
    if (isLocked) return 'Members Only';
    if (needsWallet) return 'Connect Wallet';
    if (needsBalance) return 'Need 1000+ TPC';
    if (isDisabled) return t('marketplace.status.comingSoon');
    return t('marketplace.actions.viewDetails');
  };

  const cardClass = viewMode === 'grid'
    ? 'bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#F0B90B]/30 transition-all duration-200 relative'
    : 'bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#F0B90B]/30 transition-all duration-200 relative';

  return (
    <PremiumCard className={cardClass}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {t(item.titleKey)}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-[#F0B90B]/20 text-[#F0B90B] text-xs font-medium rounded">
              {getCategoryLabel(item.category)}
            </span>
            {finalTrustLevel === 'verified' && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded flex items-center gap-1">
                <Shield className="w-3 h-3" />
                VERIFIED
              </span>
            )}
            {finalTrustLevel === 'partner' && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded flex items-center gap-1">
                <Shield className="w-3 h-3" />
                PARTNER
              </span>
            )}
            {item.badgeKeys?.map(badgeKey => (
              <span key={badgeKey} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                {t(badgeKey)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 line-clamp-3">
        {t(item.descKey)}
      </p>

      {/* Vendor Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">
            {t(item.vendorNameKey)}
          </span>
          {item.vendorSinceKey && (
            <span className="text-white/50">
              {t(item.vendorSinceKey)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#F0B90B] fill-current" />
            <span className="text-white/70 text-sm">{item.rating}</span>
          </div>
          <span className="text-white/50 text-sm">({item.reviews} reviews)</span>
        </div>
      </div>

      {/* Tags */}
      {item.tagKeys && item.tagKeys.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {item.tagKeys.slice(0, 3).map(tagKey => (
            <span
              key={tagKey}
              className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded"
            >
              #{t(tagKey)}
            </span>
          ))}
          {item.tagKeys.length > 3 && (
            <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded">
              +{item.tagKeys.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="mb-4">
        <div className="text-lg font-semibold text-white">
          {t('marketplace.price.from')} {t(item.currencyKey)}{item.priceAmount}
          <span className="text-sm font-normal text-white/70 ml-1">
            {t(item.priceUnitKey)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        {isLocked ? (
          <PremiumButton
            disabled
            className="w-full opacity-50 cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            {getCTAText()}
          </PremiumButton>
        ) : needsWallet ? (
          <PremiumButton
            disabled
            className="w-full opacity-50 cursor-not-allowed"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {getCTAText()}
          </PremiumButton>
        ) : needsBalance ? (
          <PremiumButton
            disabled
            className="w-full opacity-50 cursor-not-allowed"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {getCTAText()}
          </PremiumButton>
        ) : isDisabled ? (
          <PremiumButton
            disabled
            className="w-full opacity-50 cursor-not-allowed"
          >
            {t('marketplace.status.comingSoon')}
          </PremiumButton>
        ) : (
          <Link
            to={`/${lang}/marketplace/${item.slug}`}
            className="block"
          >
            <PremiumButton className="w-full">
              {getCTAText()}
              <ExternalLink className="w-4 h-4" />
            </PremiumButton>
          </Link>
        )}
      </div>

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white/80 mx-auto mb-2" />
            <p className="text-white font-medium">Members Only</p>
          </div>
        </div>
      )}

      {/* Wallet Lock Overlay */}
      {needsWallet && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Wallet className="w-8 h-8 text-white/80 mx-auto mb-2" />
            <p className="text-white font-medium">Connect Wallet</p>
          </div>
        </div>
      )}

      {/* Balance Lock Overlay */}
      {needsBalance && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Wallet className="w-8 h-8 text-white/80 mx-auto mb-2" />
            <p className="text-white font-medium">Need 1000+ TPC</p>
          </div>
        </div>
      )}
    </PremiumCard>
  );
}
