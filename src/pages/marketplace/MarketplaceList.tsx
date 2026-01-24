import { useState } from 'react';
import { Link } from '@/components/Router';
import { marketplaceItems, marketplaceCategories, getFeaturedMarketplaceItems, type MarketplaceItem } from '@/data/marketplace';
import { useI18n } from '@/i18n';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import { Star, ExternalLink, Filter, Grid, List } from 'lucide-react';

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

  const getCategoryLabel = (category: string) => {
    const cat = marketplaceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('marketplace.title') || 'Marketplace'}
          </h1>
          <p className="text-white/70">
            {t('marketplace.description') || 'Discover premium services and products in the TPC ecosystem'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {t('marketplace.all') || 'All'}
            </button>
            {marketplaceCategories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-[#F0B90B] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {t(`marketplace.category.${category.value}`) || category.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#F0B90B] text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F0B90B]" />
              {t('marketplace.featured') || 'Featured'}
            </h2>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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
        {regularItems.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">
              {t('marketplace.allServices') || 'All Services'}
            </h2>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-white/50" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('marketplace.noResults') || 'No services found'}
            </h3>
            <p className="text-white/70">
              {t('marketplace.tryDifferentCategory') || 'Try selecting a different category'}
            </p>
          </div>
        )}
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

  const getCategoryLabel = (category: string) => {
    const cat = marketplaceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const cardClass = viewMode === 'grid'
    ? 'bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#F0B90B]/30 transition-all duration-200'
    : 'bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#F0B90B]/30 transition-all duration-200';

  const isDisabled = item.comingSoon;

  return (
    <PremiumCard className={cardClass}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-[#F0B90B]/20 text-[#F0B90B] text-xs font-medium rounded">
              {getCategoryLabel(item.category)}
            </span>
            {item.featured && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                {t('marketplace.badges.featured') || 'FEATURED'}
              </span>
            )}
            {item.comingSoon && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">
                {t('marketplace.badges.comingSoon') || 'COMING SOON'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 line-clamp-3">
        {item.description}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded">
              +{item.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {isDisabled ? (
          <PremiumButton
            disabled
            className="w-full opacity-50 cursor-not-allowed"
          >
            {t('marketplace.comingSoon') || 'Coming Soon'}
          </PremiumButton>
        ) : (
          <Link
            to={`/${lang}/marketplace/${item.slug}`}
            className="block"
          >
            <PremiumButton className="w-full">
              {t('marketplace.viewDetails') || 'View Details'}
              <ExternalLink className="w-4 h-4" />
            </PremiumButton>
          </Link>
        )}
      </div>
    </PremiumCard>
  );
}
