import { useEffect, useMemo, useState } from "react";
import { Store, Filter, AlertCircle, Star, Shield, TrendingUp, Sparkles } from "lucide-react";
import { useI18n, getLangPath } from "../i18n";
import { PremiumShell, PremiumCard } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { getMarketplaceItemsByCategory, type MarketplaceItem, type MarketplaceCategory } from "../data/marketplace.mock";
import { Link } from "../components/Router";
import { BUILD_SHA, BUILD_TIME } from "../lib/buildInfo";

const CATEGORIES: MarketplaceCategory[] = [
  "all",
  "trading",
  "education",
  "services",
  "technology",
  "consulting",
  "media",
  "other",
];

// Safe translator with fallback (never throws)
function tf(t: (k: string) => any, key: string, fallback: string) {
  try {
    const v = t(key);
    return typeof v === "string" && v.trim().length ? v : fallback;
  } catch {
    return fallback;
  }
}

export default function MarketplacePage() {
  const { t, language: lang } = useI18n();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>("all");
  const [items, setItems] = useState<MarketplaceItem[]>([]);

  // Load items safely
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // mock delay (keep small)
        await new Promise((r) => setTimeout(r, 150));

        const result = getMarketplaceItemsByCategory(activeCategory);
        const safe = Array.isArray(result) ? result : [];

        if (alive) setItems(safe);
      } catch (e) {
        console.error("[Marketplace] load error:", e);
        if (alive) {
          setError("load_failed");
          setItems([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeCategory]);

  const title = tf(t, "marketplace.title", "Marketplace");
  const subtitle = tf(t, "marketplace.subtitle", "Alat, layanan, dan edukasi profesional");
  const badgeTrusted = tf(t, "marketplace.badgeTrusted", "Mitra Terverifikasi");
  const filterByCategory = tf(t, "marketplace.filterByCategory", "Filter berdasarkan kategori");

  const emptyTitle = tf(t, "marketplace.emptyTitle", "Belum ada item");
  const emptyDesc = tf(t, "marketplace.emptyDesc", "Belum ada item untuk kategori ini. Coba pilih kategori lain atau daftar sebagai vendor.");
  const applyAsVendor = tf(t, "marketplace.applyAsVendor", "Daftar sebagai Vendor");
  const viewDetails = tf(t, "marketplace.viewDetails", "Lihat Detail");

  const errorTitle = tf(t, "marketplace.errorTitle", "Gagal memuat marketplace");
  const errorDesc = tf(t, "marketplace.errorDesc", "Terjadi kendala saat memuat data. Silakan coba lagi.");
  const retry = tf(t, "marketplace.retry", "Coba Lagi");
  const footerDisclaimer = tf(
    t,
    "marketplace.footerDisclaimer",
    "TPC tidak menjamin hasil/keuntungan. Selalu lakukan due diligence sebelum membeli layanan/produk."
  );

  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = {
      all: tf(t, "marketplace.categories.all", "Semua"),
      trading: tf(t, "marketplace.categories.trading", "Trading"),
      education: tf(t, "marketplace.categories.education", "Edukasi"),
      services: tf(t, "marketplace.categories.services", "Layanan"),
      technology: tf(t, "marketplace.categories.technology", "Teknologi"),
      consulting: tf(t, "marketplace.categories.consulting", "Konsultasi"),
      media: tf(t, "marketplace.categories.media", "Media"),
      other: tf(t, "marketplace.categories.other", "Lainnya"),
    };
    return map;
  }, [t]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? "text-[#F0B90B] fill-current" : "text-white/20"}`}
        />
      ))}
      <span className="text-sm text-white/60 ml-1">{Number.isFinite(rating) ? rating : 0}</span>
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-lg" />
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded mb-2" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      </div>
      <div className="h-12 bg-white/5 rounded mb-4" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
    </div>
  );

  const ErrorState = () => (
    <PremiumCard>
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-white/70 mb-2">{errorTitle}</h3>
        <p className="text-sm text-white/50 mb-6">{errorDesc}</p>
        <button
          onClick={() => {
            setError(null);
            try {
              const result = getMarketplaceItemsByCategory(activeCategory);
              setItems(Array.isArray(result) ? result : []);
            } catch (e) {
              console.error("[Marketplace] retry error:", e);
              setItems([]);
              setError("load_failed");
            }
          }}
          className="px-4 py-2 bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-black font-medium rounded-lg transition-colors"
        >
          {retry}
        </button>
      </div>
    </PremiumCard>
  );

  const EmptyState = () => (
    <PremiumCard>
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F0B90B]/10 to-[#F0B90B]/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-10 h-10 text-[#F0B90B]/60" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{emptyTitle}</h3>
        <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">{emptyDesc}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActiveCategory("all")}
            className="px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
          >
            {categoryLabels.all}
          </button>

          <Link
            to={getLangPath(lang, "/member/vendor/apply")}
            className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/20 text-center"
          >
            {applyAsVendor}
          </Link>
        </div>
      </div>
    </PremiumCard>
  );

  return (
    <PremiumShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/10 rounded-full mb-6 relative">
            <Store className="w-10 h-10 text-[#F0B90B]" />
            <Sparkles className="w-6 h-6 text-[#F0B90B] absolute -top-2 -right-2" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {title}
          </h1>

          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-6 leading-relaxed">{subtitle}</p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B]/10 to-transparent border border-[#F0B90B]/30 rounded-full mb-6">
            <Shield className="w-5 h-5 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">{badgeTrusted}</span>
          </div>

          {/* Only show CTA when logged in */}
          {user ? (
            <Link
              to={getLangPath(lang, "/member/vendor/apply")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
            >
              <Store className="w-5 h-5" />
              {applyAsVendor}
            </Link>
          ) : null}
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white/40" />
            <span className="text-sm font-medium text-white/60">{filterByCategory}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 text-black shadow-lg shadow-[#F0B90B]/25"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-[#F0B90B]/30"
                }`}
              >
                {categoryLabels[category] ?? category}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const id = item?.id ?? "unknown";
              const itemTitle = item?.title?.[lang] ?? "Untitled";
              const itemDesc = item?.shortDesc?.[lang] ?? "No description available";
              const price = item?.priceLabel?.[lang] ?? "Price not available";
              const rating = typeof item?.rating === "number" ? item.rating : 0;
              const reviews = typeof item?.reviewCount === "number" ? item.reviewCount : 0;

              return (
                <PremiumCard
                  key={id}
                  className="flex flex-col hover:border-[#F0B90B]/30 transition-all hover:shadow-lg hover:shadow-[#F0B90B]/10"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/10 rounded-lg flex items-center justify-center text-2xl">
                        {item?.coverIcon || "🚀"}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{itemTitle}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(rating)}
                          <span className="text-xs text-white/40">({reviews})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {Array.isArray(item?.badges)
                        ? item.badges.map((badge, index) => (
                            <span
                              key={`${id}-badge-${index}`}
                              className="px-2 py-1 text-xs bg-gradient-to-r from-[#F0B90B]/10 to-transparent text-[#F0B90B] rounded-full border border-[#F0B90B]/30"
                            >
                              {badge}
                            </span>
                          ))
                        : null}
                    </div>

                    <p className="text-sm text-white/70 mb-4 line-clamp-2">{itemDesc}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-[#F0B90B]/10 rounded-full flex items-center justify-center">
                        <Shield className="w-3 h-3 text-[#F0B90B]" />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs font-medium text-white">{item?.provider?.name ?? "Unknown"}</p>
                        <p className="text-xs text-white/50">Since {item?.provider?.since ?? "N/A"}</p>
                      </div>

                      {item?.provider?.verified ? <Shield className="w-3 h-3 text-[#F0B90B]" /> : null}
                    </div>

                    <div className="text-lg font-bold text-[#F0B90B] mb-4">{price}</div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-4">
                    <Link
                      to={getLangPath(lang, `/marketplace/item/${id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
                    >
                      {viewDetails}
                      <TrendingUp className="w-4 h-4" />
                    </Link>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl">
            <AlertCircle className="w-5 h-5 text-white/40" />
            <p className="text-sm text-white/60">{footerDisclaimer}</p>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-white/30">
              Build: {BUILD_SHA.slice(0, 7)} • {new Date(BUILD_TIME).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
}
