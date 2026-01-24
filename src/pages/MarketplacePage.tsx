import { useEffect, useMemo, useState } from "react";
import { Store, Filter, AlertCircle, Star, Shield, TrendingUp, Sparkles, X } from "lucide-react";
import { useI18n, getLangPath } from "../i18n";
import { PremiumShell, PremiumCard } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { getMarketplaceItemsByCategory, type MarketplaceItem, type MarketplaceCategory } from "../data/marketplace.mock";
import { Link, useNavigate } from "../components/Router";
import { getBuildInfo } from "../lib/buildInfo";
import { supabase } from "../lib/supabase";

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

// Slug utility function
const toSlug = (s: string): string => {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

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
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [selected, setSelected] = useState<MarketplaceItem | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Extract slug from URL
  const slugFromUrl = useMemo(() => {
    const pathParts = window.location.pathname.split('/');
    const langIndex = pathParts.findIndex(part => part === 'en' || part === 'id');
    if (langIndex !== -1 && pathParts[langIndex + 1] === 'marketplace' && pathParts[langIndex + 2]) {
      return pathParts[langIndex + 2];
    }
    return null;
  }, []);

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
        
        // Add slug to items
        const itemsWithSlug = safe.map(item => ({
          ...item,
          slug: item.slug || `${toSlug(item.title?.[lang] || item.title?.en || 'item')}-${item.id}`
        }));

        if (alive) setItems(itemsWithSlug);
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

  // Check auth session
  useEffect(() => {
    let alive = true;

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (alive) setIsAuthed(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setIsAuthed(!!session);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  // ESC key listener for modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selected) {
        setSelected(null);
      }
    };

    if (selected) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [selected]);

  // Auto-open modal from URL slug
  useEffect(() => {
    if (slugFromUrl && items.length > 0) {
      const found = items.find(item => item.slug === slugFromUrl);
      if (found) {
        setSelected(found);
      } else {
        // Slug not found - show not found state
        setSelected(null);
      }
    }
  }, [slugFromUrl, items]);

  // Check if we have an invalid slug
  const hasInvalidSlug = slugFromUrl && items.length > 0 && !items.find(item => item.slug === slugFromUrl);

  // Update URL when modal opens/closes
  useEffect(() => {
    if (selected) {
      navigate(`/${lang}/marketplace/${selected.slug}`);
      // Update document title for SEO
      document.title = `${selected.title?.[lang] || selected.title?.en || 'Item'} — TPC Marketplace`;
    } else {
      navigate(`/${lang}/marketplace`);
      // Restore document title
      document.title = 'Marketplace — TPC';
    }
  }, [selected, lang, navigate]);

  const title = tf(t, "marketplace.title", "Marketplace");
  const subtitle = tf(t, "marketplace.subtitle", "Alat, layanan, dan edukasi profesional");
  const badgeTrusted = tf(t, "marketplace.badgeTrusted", "Mitra Terverifikasi");
  const filterByCategory = tf(t, "marketplace.filterByCategory", "Filter berdasarkan kategori");
  const verifiedOnlyLabel = tf(t, "marketplace.verifiedOnly", "Mitra Terverifikasi");
  const badgeVerified = tf(t, "marketplace.badgeVerified", "Terverifikasi");

  const emptyTitle = tf(t, "marketplace.emptyTitle", "Belum ada item");
  const emptyDesc = tf(t, "marketplace.emptyDesc", "Belum ada item untuk kategori ini. Coba pilih kategori lain atau daftar sebagai vendor.");
  const applyAsVendor = tf(t, "marketplace.applyAsVendor", "Daftar sebagai Vendor");
  const viewDetails = tf(t, "marketplace.viewDetails", "Lihat Detail");

  const emptyVerifiedTitle = tf(t, "marketplace.emptyVerifiedTitle", "Belum ada mitra terverifikasi");
  const emptyVerifiedSubtitle = tf(t, "marketplace.emptyVerifiedSubtitle", "Kami sedang onboarding vendor terverifikasi. Silakan cek kembali.");
  const emptyVerifiedCta = tf(t, "marketplace.emptyVerifiedCta", "Gabung Telegram untuk update");

  // Modal translations
  const modalVerifiedBadge = tf(t, "marketplace.modal.verifiedBadge", "Terverifikasi");
  const modalCategory = tf(t, "marketplace.modal.category", "Kategori");
  const modalAboutVendor = tf(t, "marketplace.modal.aboutVendor", "Tentang Vendor");
  const modalLegalNote = tf(t, "marketplace.modal.legalNote", "Vendor beroperasi secara independen. TPC tidak bertanggung jawab atas transaksi.");
  const modalCtaSignIn = tf(t, "marketplace.modal.ctaSignIn", "Login untuk Lanjut");
  const modalCtaProceed = tf(t, "marketplace.modal.ctaProceed", "Lanjut");
  const modalClose = tf(t, "marketplace.modal.close", "Tutup");
  const modalComingSoon = tf(t, "marketplace.modal.comingSoon", "Checkout segera hadir");

  const notFoundTitle = tf(t, "marketplace.notFound.title", "Item tidak ditemukan");
  const notFoundDesc = tf(t, "marketplace.notFound.desc", "Item yang Anda cari tidak ada atau telah dihapus.");
  const notFoundBack = tf(t, "marketplace.notFound.back", "Kembali ke Marketplace");

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

  // Apply verified filter after category filter
  const filteredItems = useMemo(() => {
    let result = items;
    if (verifiedOnly) {
      result = result.filter(item => item.verified === true);
    }
    return result;
  }, [items, verifiedOnly]);

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

  const EmptyVerifiedState = () => (
    <PremiumCard>
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F0B90B]/10 to-[#F0B90B]/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-[#F0B90B]/60" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{emptyVerifiedTitle}</h3>
        <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">{emptyVerifiedSubtitle}</p>

        <a
          href="https://t.me/tpcglobalcommunity"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
        >
          {emptyVerifiedCta}
        </a>
      </div>
    </PremiumCard>
  );

  const NotFoundState = () => (
    <PremiumCard>
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500/60" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{notFoundTitle}</h3>
        <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">{notFoundDesc}</p>

        <button
          onClick={() => navigate(`/${lang}/marketplace`)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
        >
          {notFoundBack}
        </button>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white/40" />
              <span className="text-sm font-medium text-white/60">{filterByCategory}</span>
            </div>
            
            <button
              onClick={() => setVerifiedOnly(v => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                verifiedOnly
                  ? "bg-[#F0B90B]/20 border-[#F0B90B] text-[#F0B90B] shadow-lg shadow-[#F0B90B]/20"
                  : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">{verifiedOnlyLabel}</span>
            </button>
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
        ) : hasInvalidSlug ? (
          <NotFoundState />
        ) : filteredItems.length === 0 ? (
          verifiedOnly ? <EmptyVerifiedState /> : <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const id = item?.id ?? "unknown";
              const itemTitle = item?.title?.[lang] ?? "Untitled";
              const itemDesc = item?.shortDesc?.[lang] ?? "No description available";
              const price = item?.priceLabel?.[lang] ?? "Price not available";
              const rating = typeof item?.rating === "number" ? item.rating : 0;
              const reviews = typeof item?.reviewCount === "number" ? item.reviewCount : 0;

              return (
                <div
                  key={id}
                  className="cursor-pointer"
                  onClick={() => setSelected(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(item);
                    }
                  }}
                >
                  <PremiumCard className="flex flex-col hover:border-[#F0B90B]/30 transition-all hover:shadow-lg hover:shadow-[#F0B90B]/10">
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
                      {item?.verified && (
                        <span className="px-2 py-1 text-xs bg-gradient-to-r from-[#F0B90B]/20 to-[#F0B90B]/10 text-[#F0B90B] rounded-full border border-[#F0B90B]/40 shadow-sm shadow-[#F0B90B]/10">
                          {badgeVerified}
                        </span>
                      )}
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
                    <button
                      onClick={() => setSelected(item)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
                    >
                      {viewDetails}
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </PremiumCard>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selected && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            
            {/* Modal Panel */}
            <div 
              className="relative max-w-xl w-full bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {selected.title?.[lang] || "Untitled"}
                    </h3>
                    <p className="text-sm text-white/60">
                      {selected.provider?.name || "Unknown Vendor"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Verified Badge */}
                {selected.verified && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#F0B90B]/20 to-[#F0B90B]/10 text-[#F0B90B] rounded-full border border-[#F0B90B]/40 shadow-sm shadow-[#F0B90B]/10">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">{modalVerifiedBadge}</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Category */}
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">{modalCategory}</span>
                  <p className="text-sm text-white font-medium capitalize">{selected.category}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {renderStars(selected.rating || 0)}
                  <span className="text-xs text-white/40">({selected.reviewCount || 0})</span>
                </div>

                {/* Tags */}
                {selected.tags && selected.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selected.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">{modalAboutVendor}</span>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {selected.desc?.[lang] || selected.shortDesc?.[lang] || "No description available"}
                  </p>
                </div>

                {/* Legal Note */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40 italic">{modalLegalNote}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                {/* Primary CTA */}
                {isAuthed ? (
                  <button
                    onClick={() => alert(modalComingSoon)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25"
                  >
                    {modalCtaProceed}
                  </button>
                ) : (
                  <Link
                    to={getLangPath(lang, "/signin")}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/90 hover:from-[#F0B90B]/90 hover:to-[#F0B90B] text-black font-medium rounded-lg transition-all shadow-lg shadow-[#F0B90B]/25 text-center"
                  >
                    {modalCtaSignIn}
                  </Link>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors border border-white/20"
                >
                  {modalClose}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl">
            <AlertCircle className="w-5 h-5 text-white/40" />
            <p className="text-sm text-white/60">{footerDisclaimer}</p>
          </div>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-white/40">
              Build: {(() => {
                const build = getBuildInfo();
                const shaShort = build.sha === "dev" ? "dev" : build.sha.slice(0, 7);
                const localTime = new Date(build.time).toLocaleString();
                return `${shaShort} • ${localTime}`;
              })()}
            </p>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
}
