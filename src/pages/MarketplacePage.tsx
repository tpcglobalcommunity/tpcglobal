import { useState, useEffect } from 'react';
import { Store, ExternalLink, MessageCircle, Filter, AlertCircle } from 'lucide-react';
import { Language, useTranslations, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';
import { getPublicVendors, PublicVendor } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketplacePageProps {
  lang: Language;
}

const CATEGORIES = [
  'all',
  'trading',
  'education',
  'services',
  'technology',
  'consulting',
  'media',
  'other',
];

const MarketplacePage = ({ lang }: MarketplacePageProps) => {
  const t = useTranslations(lang);
  const { user } = useAuth();

  const [vendors, setVendors] = useState<PublicVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<PublicVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadVendors();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredVendors(vendors);
    } else {
      setFilteredVendors(vendors.filter(v => v.category === selectedCategory));
    }
  }, [selectedCategory, vendors]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await getPublicVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDescription = (vendor: PublicVendor): string => {
    return lang === 'id' ? vendor.description_id : vendor.description_en;
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0B90B]/10 rounded-full mb-6">
            <Store className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t.marketplace.title}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-6">
            {t.marketplace.subtitle}
          </p>

          {user && (
            <PremiumButton onClick={() => window.location.href = getLangPath(lang, '/member/vendor/apply')}>
              <Store className="w-5 h-5" />
              {t.marketplace.applyAsVendor}
            </PremiumButton>
          )}
        </div>

        <NoticeBox variant="warning" className="mb-8">
          {t.marketplace.disclaimer}
        </NoticeBox>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white/40" />
            <span className="text-sm font-medium text-white/60">{t.marketplace.filterByCategory}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#F0B90B] text-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {category === 'all'
                  ? t.marketplace.categories.all
                  : t.marketplace.categories[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-[#F0B90B]/30 border-t-[#F0B90B] rounded-full animate-spin" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <PremiumCard>
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/70 mb-2">
                {t.marketplace.emptyTitle}
              </h3>
              <p className="text-sm text-white/50">
                {t.marketplace.emptyDesc}
              </p>
            </div>
          </PremiumCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <PremiumCard key={vendor.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{vendor.brand_name}</h3>
                    <span className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded border border-white/20">
                      {t.marketplace.categories[vendor.category] || vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-white/70 mb-4 line-clamp-3">
                    {getDescription(vendor)}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                  {vendor.website_url && (
                    <a
                      href={vendor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 border border-[#F0B90B]/30 rounded-lg text-[#F0B90B] font-medium transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t.marketplace.visitWebsite}
                    </a>
                  )}
                  {vendor.contact_telegram && (
                    <a
                      href={`https://t.me/${vendor.contact_telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 font-medium transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.marketplace.contactTelegram}
                    </a>
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white/40" />
            <p className="text-sm text-white/60">
              {t.marketplace.footerDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default MarketplacePage;
