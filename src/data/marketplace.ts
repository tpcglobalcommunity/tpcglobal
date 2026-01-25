export type MarketplaceCategory =
  | "all" | "trading" | "education" | "services" | "technology" | "consulting" | "media" | "other";

export interface MarketplaceItem {
  id: string;
  slug: string;
  category: MarketplaceCategory;
  featured?: boolean;
  comingSoon?: boolean;

  // i18n keys (NO HARD STRING)
  titleKey: string;
  descKey: string;
  badgeKeys?: string[];
  tagKeys?: string[];

  vendorNameKey: string;
  vendorSinceKey?: string; // contoh "marketplace.vendor.since2021"
  rating: number;
  reviews: number;

  priceAmount: number;          // 299
  priceUnitKey: string;         // "marketplace.price.perMonth" OR "marketplace.price.oneTime"
  currencyKey: string;          // "marketplace.currency.usd" (default)

  // Phase 2: Member Trust & Gating
  access: "public" | "member";        // default: "public"
  trustLevel?: "verified" | "partner"; // optional

  // Phase 4: Vendor Integration
  vendorBrand?: string; // Maps to vendor application brand_name for MVP
}

export const marketplaceCategories: MarketplaceCategory[] = [
  "all", "trading", "education", "services", "technology", "consulting", "media", "other"
];

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    slug: "tpc-trading-academy",
    titleKey: "marketplace.items.tpcTradingAcademy.title",
    descKey: "marketplace.items.tpcTradingAcademy.desc",
    category: "education",
    tagKeys: ["marketplace.tags.education", "marketplace.tags.trading", "marketplace.tags.technical", "marketplace.tags.risk"],
    badgeKeys: ["marketplace.badges.featured", "marketplace.badges.beginnerFriendly"],
    vendorNameKey: "marketplace.vendors.tpcAcademy.name",
    vendorSinceKey: "marketplace.vendors.tpcAcademy.since",
    rating: 4.8,
    reviews: 234,
    priceAmount: 299,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: true,
    access: "public",
  },
  {
    id: "2",
    slug: "sinyal-trading-premium",
    titleKey: "marketplace.items.premiumSignals.title",
    descKey: "marketplace.items.premiumSignals.desc",
    category: "trading",
    tagKeys: ["marketplace.tags.signals", "marketplace.tags.trading", "marketplace.tags.analysis", "marketplace.tags.tools"],
    badgeKeys: ["marketplace.badges.featured", "marketplace.badges.verified"],
    vendorNameKey: "marketplace.vendors.tpcTradingLabs.name",
    vendorSinceKey: "marketplace.vendors.tpcTradingLabs.since",
    rating: 4.9,
    reviews: 567,
    priceAmount: 99,
    priceUnitKey: "marketplace.price.perMonth",
    currencyKey: "marketplace.currency.usd",
    featured: true,
    access: "member",
    trustLevel: "verified",
    vendorBrand: "TPC Trading Labs",
  },
  {
    id: "3",
    slug: "blockchain-consulting",
    titleKey: "marketplace.items.blockchainConsulting.title",
    descKey: "marketplace.items.blockchainConsulting.desc",
    category: "consulting",
    tagKeys: ["marketplace.tags.blockchain", "marketplace.tags.consulting", "marketplace.tags.web3", "marketplace.tags.smartContracts"],
    badgeKeys: ["marketplace.badges.professional"],
    vendorNameKey: "marketplace.vendors.tpcTechSolutions.name",
    vendorSinceKey: "marketplace.vendors.tpcTechSolutions.since",
    rating: 4.7,
    reviews: 89,
    priceAmount: 2500,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    access: "public",
  },
  {
    id: "4",
    slug: "custom-wallet-development",
    titleKey: "marketplace.items.customWalletDevelopment.title",
    descKey: "marketplace.items.customWalletDevelopment.desc",
    category: "technology",
    tagKeys: ["marketplace.tags.wallet", "marketplace.tags.development", "marketplace.tags.blockchain", "marketplace.tags.security"],
    badgeKeys: ["marketplace.badges.technical", "marketplace.badges.comingSoon"],
    vendorNameKey: "marketplace.vendors.tpcTechSolutions.name",
    vendorSinceKey: "marketplace.vendors.tpcTechSolutions.since",
    rating: 4.6,
    reviews: 45,
    priceAmount: 5000,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    comingSoon: true,
    access: "public",
  },
  {
    id: "5",
    slug: "alat-analisis-pasar",
    titleKey: "marketplace.items.marketAnalysisTools.title",
    descKey: "marketplace.items.marketAnalysisTools.desc",
    category: "technology",
    tagKeys: ["marketplace.tags.analysis", "marketplace.tags.dashboard", "marketplace.tags.tools", "marketplace.tags.trading"],
    badgeKeys: ["marketplace.badges.featured", "marketplace.badges.aiPowered"],
    vendorNameKey: "marketplace.vendors.tpcTradingLabs.name",
    vendorSinceKey: "marketplace.vendors.tpcTradingLabs.since",
    rating: 4.8,
    reviews: 312,
    priceAmount: 149,
    priceUnitKey: "marketplace.price.perMonth",
    currencyKey: "marketplace.currency.usd",
    featured: true,
    access: "member",
    trustLevel: "partner",
  },
  {
    id: "6",
    slug: "content-creation-services",
    titleKey: "marketplace.items.contentCreationServices.title",
    descKey: "marketplace.items.contentCreationServices.desc",
    category: "media",
    tagKeys: ["marketplace.tags.content", "marketplace.tags.media", "marketplace.tags.marketing", "marketplace.tags.socialMedia"],
    badgeKeys: ["marketplace.badges.creative"],
    vendorNameKey: "marketplace.vendors.tpcMedia.name",
    vendorSinceKey: "marketplace.vendors.tpcMedia.since",
    rating: 4.5,
    reviews: 78,
    priceAmount: 1200,
    priceUnitKey: "marketplace.price.perMonth",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    access: "public",
  },
  {
    id: "7",
    slug: "defi-yield-farming",
    titleKey: "marketplace.items.defiYieldFarming.title",
    descKey: "marketplace.items.defiYieldFarming.desc",
    category: "education",
    tagKeys: ["marketplace.tags.education", "marketplace.tags.defi", "marketplace.tags.yieldFarming", "marketplace.tags.strategies"],
    badgeKeys: ["marketplace.badges.advanced"],
    vendorNameKey: "marketplace.vendors.tpcAcademy.name",
    vendorSinceKey: "marketplace.vendors.tpcAcademy.since",
    rating: 4.4,
    reviews: 156,
    priceAmount: 199,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    access: "public",
  },
  {
    id: "8",
    slug: "smart-contract-audit",
    titleKey: "marketplace.items.smartContractAudit.title",
    descKey: "marketplace.items.smartContractAudit.desc",
    category: "services",
    tagKeys: ["marketplace.tags.audit", "marketplace.tags.security", "marketplace.tags.smartContracts", "marketplace.tags.compliance"],
    badgeKeys: ["marketplace.badges.featured", "marketplace.badges.verified", "marketplace.badges.essential"],
    vendorNameKey: "marketplace.vendors.tpcRiskSolutions.name",
    vendorSinceKey: "marketplace.vendors.tpcRiskSolutions.since",
    rating: 4.9,
    reviews: 423,
    priceAmount: 3500,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: true,
    access: "member",
    trustLevel: "verified",
  },
  {
    id: "9",
    slug: "tpc-community-management",
    titleKey: "marketplace.items.tpcCommunityManagement.title",
    descKey: "marketplace.items.tpcCommunityManagement.desc",
    category: "services",
    tagKeys: ["marketplace.tags.community", "marketplace.tags.management", "marketplace.tags.socialMedia", "marketplace.tags.engagement"],
    badgeKeys: ["marketplace.badges.comingSoon"],
    vendorNameKey: "marketplace.vendors.tpcCommunity.name",
    vendorSinceKey: "marketplace.vendors.tpcCommunity.since",
    rating: 4.6,
    reviews: 92,
    priceAmount: 800,
    priceUnitKey: "marketplace.price.perMonth",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    comingSoon: true,
    access: "public",
  },
  {
    id: "10",
    slug: "nft-marketplace-integration",
    titleKey: "marketplace.items.nftMarketplaceIntegration.title",
    descKey: "marketplace.items.nftMarketplaceIntegration.desc",
    category: "technology",
    tagKeys: ["marketplace.tags.nft", "marketplace.tags.marketplace", "marketplace.tags.integration", "marketplace.tags.trading"],
    badgeKeys: ["marketplace.badges.technical", "marketplace.badges.comingSoon"],
    vendorNameKey: "marketplace.vendors.tpcTechSolutions.name",
    vendorSinceKey: "marketplace.vendors.tpcTechSolutions.since",
    rating: 4.5,
    reviews: 34,
    priceAmount: 4500,
    priceUnitKey: "marketplace.price.oneTime",
    currencyKey: "marketplace.currency.usd",
    featured: false,
    comingSoon: true,
    access: "public",
  },
];

export function getMarketplaceItemBySlug(slug: string): MarketplaceItem | undefined {
  return marketplaceItems.find(item => item.slug === slug);
}

export function getMarketplaceItemsByCategory(category: MarketplaceItem['category']): MarketplaceItem[] {
  return marketplaceItems.filter(item => item.category === category);
}

export function getFeaturedMarketplaceItems(): MarketplaceItem[] {
  return marketplaceItems.filter(item => item.featured);
}
