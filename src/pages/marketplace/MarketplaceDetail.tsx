import { Link } from '@/components/Router';
import { getMarketplaceItemBySlug, marketplaceCategories } from '@/data/marketplace';
import { useI18n } from '@/i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '@/components/ui';
import { ArrowLeft, ExternalLink, Star, Tag, Clock, Users } from 'lucide-react';

type Props = {
  lang: string;
  slug: string;
};

export default function MarketplaceDetail({ lang, slug }: Props) {
  const { t } = useI18n();
  const item = getMarketplaceItemBySlug(slug);

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
              {t('marketplace.notFound') || 'Service Not Found'}
            </h1>
            <p className="text-white/70 mb-6">
              {t('marketplace.notFoundDescription') || 'The marketplace service you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link to={`/${lang}/marketplace`}>
              <PremiumButton>
                <ArrowLeft className="w-4 h-4" />
                {t('marketplace.backToList') || 'Back to Marketplace'}
              </PremiumButton>
            </Link>
          </div>
        </div>
      </PremiumShell>
    );
  }

  const getCategoryLabel = (category: string) => {
    const cat = marketplaceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getCTAText = () => {
    if (item.comingSoon) {
      return t('marketplace.comingSoon') || 'Coming Soon';
    }
    switch (item.category) {
      case 'education':
      case 'consulting':
        return t('marketplace.applyAsVendor') || 'Apply as Vendor';
      case 'services':
      case 'technology':
        return t('marketplace.contactProvider') || 'Contact Provider';
      default:
        return t('marketplace.getInTouch') || 'Get in Touch';
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
              {t('marketplace.backToList') || 'Back to Marketplace'}
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
                {item.featured && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {t('marketplace.badges.featured') || 'FEATURED'}
                  </span>
                )}
                {item.comingSoon && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t('marketplace.badges.comingSoon') || 'COMING SOON'}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                {item.title}
              </h1>
              
              <p className="text-white/70 text-lg leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#F0B90B]" />
              {t('marketplace.tags') || 'Tags'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/10 text-white/70 text-sm rounded-full hover:bg-white/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mb-8">
          <PremiumCard className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t('marketplace.interested') || 'Interested in this service?'}
                </h3>
                <p className="text-white/70 text-sm">
                  {item.comingSoon 
                    ? t('marketplace.comingSoonDescription') || 'This service is currently under development and will be available soon.'
                    : t('marketplace.ctaDescription') || 'Get in touch with the service provider to learn more and get started.'
                  }
                </p>
              </div>
              
              <div className="flex-shrink-0">
                {item.comingSoon ? (
                  <PremiumButton disabled className="opacity-50 cursor-not-allowed">
                    <Clock className="w-4 h-4" />
                    {getCTAText()}
                  </PremiumButton>
                ) : (
                  <PremiumButton>
                    <ExternalLink className="w-4 h-4" />
                    {getCTAText()}
                  </PremiumButton>
                )}
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F0B90B]" />
              {t('marketplace.providerInfo') || 'Provider Information'}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/50 text-sm">{t('marketplace.category') || 'Category'}</p>
                <p className="text-white font-medium">{getCategoryLabel(item.category)}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">{t('marketplace.serviceId') || 'Service ID'}</p>
                <p className="text-white font-medium">#{item.id}</p>
              </div>
              <div>
                <p className="text-white/50 text-sm">{t('marketplace.status') || 'Status'}</p>
                <p className="text-white font-medium">
                  {item.comingSoon 
                    ? t('marketplace.comingSoon') || 'Coming Soon'
                    : t('marketplace.available') || 'Available'
                  }
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('marketplace.nextSteps') || 'Next Steps'}
            </h3>
            <div className="space-y-3">
              {item.comingSoon ? (
                <>
                  <NoticeBox variant="info">
                    <p className="text-sm">
                      {t('marketplace.notifyWhenAvailable') || 'This service is coming soon. Check back later for availability.'}
                    </p>
                  </NoticeBox>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="w-6 h-6 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F0B90B]">1</span>
                    </div>
                    <span className="text-sm">{t('marketplace.step1') || 'Click the contact button above'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="w-6 h-6 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F0B90B]">2</span>
                    </div>
                    <span className="text-sm">{t('marketplace.step2') || 'Fill out the inquiry form'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <div className="w-6 h-6 bg-[#F0B90B]/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#F0B90B]">3</span>
                    </div>
                    <span className="text-sm">{t('marketplace.step3') || 'Wait for provider response'}</span>
                  </div>
                </>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </PremiumShell>
  );
}
