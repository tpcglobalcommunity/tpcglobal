import { useState, useEffect } from 'react';
import { Store, ExternalLink, MessageCircle, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { Language, useI18n, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';
import { getPublicVendors, PublicVendor } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TrustBadges } from '../components/trust/TrustBadges';

// Safe string helper
const s = (v: any) => (typeof v === 'string' ? v : (v == null ? '' : String(v)));

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
  const { t } = useI18n();
  const { user } = useAuth();

  const [vendors, setVendors] = useState<PublicVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<PublicVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, [selectedCategory]);

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
      setError(null);
      
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      
      const data = await getPublicVendors(category);
      setVendors(data || []);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Failed to load vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0B90B]/10 rounded-full mb-6">
            <Store className="w-8 h-8 text-[#F0B90B]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("marketplace.title", "Marketplace")}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-6">
            {t("marketplace.subtitle", "Discover trusted vendors and services")}
          </p>

          {user && (
            <PremiumButton onClick={() => window.location.href = getLangPath(lang, '/member/vendor/apply')}>
              <Store className="w-5 h-5" />
              {t("marketplace.applyAsVendor", "Apply as Vendor")}
            </PremiumButton>
          )}
        </div>

        <NoticeBox variant="warning" className="mb-8">
          {t("marketplace.disclaimer", "Disclaimer text")}
        </NoticeBox>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white/40" />
            <span className="text-sm font-medium text-white/60">{t("marketplace.filterByCategory", "Filter by category")}</span>
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
                  ? t("marketplace.categories.all", "All")
                  : t(`marketplace.categories.${category}`, category.charAt(0).toUpperCase() + category.slice(1))}
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
                {t("marketplace.emptyTitle", "No vendors found")}
              </h3>
              <p className="text-sm text-white/50">
                {t("marketplace.emptyDesc", "No vendors in this category")}
              </p>
            </div>
          </PremiumCard>
        ) : error ? (
          <PremiumCard>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/70 mb-2">
                {t("marketplace.errorTitle", "Failed to load vendors")}
              </h3>
              <p className="text-sm text-white/50 mb-4">
                {t("marketplace.errorDesc", "Please try again later")}
              </p>
              <PremiumButton onClick={loadVendors} variant="secondary">
                <RefreshCw className="w-4 h-4" />
                {t("marketplace.retry", "Retry")}
              </PremiumButton>
            </div>
          </PremiumCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor: PublicVendor) => (
              <PremiumCard key={vendor.id} className="flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{s(vendor.brand_name)}</h3>
                    <span className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded border border-white/20">
                      {t(`marketplace.categories.${s(vendor.category)}`, s(vendor.category).charAt(0).toUpperCase() + s(vendor.category).slice(1))}
                    </span>
                  </div>

                  <div className="mb-3">
                    <TrustBadges
                      role={vendor.role as any}
                      is_verified={vendor.is_verified}
                      can_invite={false}
                      vendor_status="approved"
                      vendor_brand_name={vendor.brand_name}
                      mode="public"
                      lang={lang}
                    />
                  </div>

                  <p className="text-sm text-white/70 mb-4 line-clamp-3">
                    {s(lang === 'id' ? vendor.description_id : vendor.description_en)}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                  {s(vendor.website_url) && (
                    <a
                      href={s(vendor.website_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 border border-[#F0B90B]/30 rounded-lg text-[#F0B90B] font-medium transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("marketplace.visitWebsite", "Visit Website")}
                    </a>
                  )}
                  {s(vendor.contact_telegram) && (
                    <a
                      href={`https://t.me/${s(vendor.contact_telegram).replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 font-medium transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("marketplace.contactTelegram", "Contact on Telegram")}
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
              {t("marketplace.footerDisclaimer", "Always verify vendors independently")}
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default MarketplacePage;
