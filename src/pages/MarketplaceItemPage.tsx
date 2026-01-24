import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Star, Shield, CheckCircle, AlertCircle, ExternalLink, MessageCircle, Clock, Users, Award, Sparkles, Calendar } from 'lucide-react';
import { Language, useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { getMarketplaceItemById, type MarketplaceItem } from "@/data/marketplace.mock";
import { Link } from "@/components/Router";

interface MarketplaceItemPageProps {
  lang: Language;
}

const MarketplaceItemPage = ({ lang }: MarketplaceItemPageProps) => {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundItem = getMarketplaceItemById(id);
      setItem(foundItem || null);
      setLoading(false);
    }
  }, [id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(rating)
                ? 'text-[#F0B90B] fill-current'
                : 'text-white/20'
            }`}
          />
        ))}
        <span className="text-sm text-white/60 ml-1">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-white/10 rounded mb-6 w-3/4"></div>
            <div className="h-64 bg-white/5 rounded mb-6"></div>
            <div className="h-32 bg-white/5 rounded"></div>
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (!item) {
    return (
      <PremiumShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <PremiumCard>
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {t("marketplace.notFoundTitle")}
              </h1>
              <p className="text-white/60 mb-6">
                {t("marketplace.notFoundDesc")}
              </p>
              <Link to={getLangPath(lang, '/marketplace')}>
                <PremiumButton>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Marketplace
                </PremiumButton>
              </Link>
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Back Button */}
        <Link to={getLangPath(lang, '/marketplace')} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/10 rounded-2xl flex items-center justify-center text-3xl relative">
                {item.coverIcon || '🚀'}
                <Sparkles className="w-6 h-6 text-[#F0B90B] absolute -top-2 -right-2" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {item.title[lang]}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  {renderStars(item.rating)}
                  <span className="text-sm text-white/40">({item.reviewCount} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-[#F0B90B]/10 to-transparent text-[#F0B90B] rounded-full border border-[#F0B90B]/30"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {item.updatedAt}</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {item.desc[lang]}
            </p>

            {/* Provider Info */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10 mb-6">
              <div className="w-12 h-12 bg-[#F0B90B]/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#F0B90B]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{item.provider.name}</p>
                <p className="text-sm text-white/60">Verified Provider • Since {item.provider.since}</p>
              </div>
              {item.provider.verified && (
                <Shield className="w-5 h-5 text-[#F0B90B]" />
              )}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="lg:col-span-1">
            <PremiumCard className="sticky top-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#F0B90B] mb-2 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/80 bg-clip-text text-transparent">
                  {item.priceLabel[lang]}
                </div>
                <p className="text-sm text-white/60">Starting price</p>
              </div>

              <PremiumButton className="w-full mb-4 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] shadow-lg shadow-[#F0B90B]/25">
                {t("marketplace.requestAccess")}
              </PremiumButton>

              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </PremiumCard>
          </div>
        </div>

        {/* Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Overview */}
          <div className="lg:col-span-2">
            <PremiumCard className="mb-8 bg-gradient-to-br from-white/5 to-transparent">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F0B90B]" />
                {t("marketplace.sections.overview")}
              </h2>
              <p className="text-white/70 leading-relaxed">
                {item.desc[lang]}
              </p>
            </PremiumCard>

            {/* What You Get */}
            <PremiumCard className="mb-8 bg-gradient-to-br from-white/5 to-transparent">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F0B90B]" />
                {t("marketplace.sections.benefits")}
              </h2>
              <ul className="space-y-3">
                {item.features[lang].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>

            {/* Requirements */}
            <PremiumCard className="mb-8 bg-gradient-to-br from-white/5 to-transparent">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#F0B90B]" />
                {t("marketplace.sections.requirements")}
              </h2>
              <ul className="space-y-3">
                {item.requirements[lang].map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{requirement}</span>
                  </li>
                ))}
              </ul>
            </PremiumCard>

            {/* Disclaimer */}
            <NoticeBox variant="warning" className="mb-8">
              <h3 className="font-medium text-white mb-2">{t("marketplace.sections.disclaimer")}</h3>
              <p className="text-sm text-white/60">
                All marketplace services are provided by independent third-party providers. 
                TPC does not endorse or guarantee any services listed. Please conduct your own 
                due diligence before making any purchase decisions.
              </p>
            </NoticeBox>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <PremiumCard className="mb-6 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-medium text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Rating</span>
                  <span className="text-white font-medium">{item.rating}/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Reviews</span>
                  <span className="text-white font-medium">{item.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Category</span>
                  <span className="text-white font-medium capitalize">{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Provider</span>
                  <span className="text-white font-medium">{item.provider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Updated</span>
                  <span className="text-white font-medium">{item.updatedAt}</span>
                </div>
              </div>
            </PremiumCard>

            {/* Tags */}
            <PremiumCard className="mb-6 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-medium text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-white/10 text-white/70 rounded-full border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </PremiumCard>

            {/* Contact */}
            <PremiumCard className="bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-medium text-white mb-4">Contact Provider</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25">
                  <MessageCircle className="w-4 h-4" />
                  Contact on Telegram
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all">
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </button>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default MarketplaceItemPage;
