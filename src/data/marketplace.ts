export interface MarketplaceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "trading" | "education" | "services" | "technology" | "consulting" | "media" | "other";
  tags: string[];
  featured: boolean;
  comingSoon?: boolean;
}

export interface MarketplaceCategory {
  label: string;
  value: MarketplaceItem['category'];
}

export const marketplaceCategories: MarketplaceCategory[] = [
  { label: "Trading", value: "trading" },
  { label: "Education", value: "education" },
  { label: "Services", value: "services" },
  { label: "Technology", value: "technology" },
  { label: "Consulting", value: "consulting" },
  { label: "Media", value: "media" },
  { label: "Other", value: "other" },
];

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: "1",
    slug: "tpc-trading-academy",
    title: "TPC Trading Academy",
    description: "Comprehensive trading education program covering technical analysis, risk management, and advanced trading strategies for TPC tokens.",
    category: "education",
    tags: ["education", "trading", "technical analysis", "risk management"],
    featured: true,
  },
  {
    id: "2",
    slug: "premium-signals",
    title: "Premium Trading Signals",
    description: "Get real-time trading signals from expert analysts with high accuracy rates and detailed entry/exit points.",
    category: "trading",
    tags: ["signals", "trading", "analysis", "real-time"],
    featured: true,
  },
  {
    id: "3",
    slug: "blockchain-consulting",
    title: "Blockchain Consulting Services",
    description: "Professional blockchain consulting for businesses looking to integrate Web3 technologies and smart contracts.",
    category: "consulting",
    tags: ["consulting", "blockchain", "web3", "smart contracts"],
    featured: false,
  },
  {
    id: "4",
    slug: "tpc-wallet-development",
    title: "Custom TPC Wallet Development",
    description: "Custom wallet development services for TPC ecosystem with advanced security features and user-friendly interfaces.",
    category: "technology",
    tags: ["development", "wallet", "security", "custom"],
    featured: false,
    comingSoon: true,
  },
  {
    id: "5",
    slug: "market-analysis-tools",
    title: "Market Analysis Tools",
    description: "Advanced market analysis tools and dashboards for tracking TPC market trends and making informed decisions.",
    category: "technology",
    tags: ["analysis", "tools", "dashboard", "market data"],
    featured: true,
  },
  {
    id: "6",
    slug: "content-creation-services",
    title: "Crypto Content Creation",
    description: "Professional content creation services for crypto projects including articles, videos, and social media content.",
    category: "media",
    tags: ["content", "media", "marketing", "social media"],
    featured: false,
  },
  {
    id: "7",
    slug: "defi-yield-farming",
    title: "DeFi Yield Farming Guide",
    description: "Complete guide to yield farming strategies in the DeFi space with TPC tokens and other cryptocurrencies.",
    category: "education",
    tags: ["education", "defi", "yield farming", "strategies"],
    featured: false,
  },
  {
    id: "8",
    slug: "smart-contract-audit",
    title: "Smart Contract Audit Services",
    description: "Professional smart contract auditing services to ensure security and compliance with industry standards.",
    category: "services",
    tags: ["audit", "security", "smart contracts", "compliance"],
    featured: true,
  },
  {
    id: "9",
    slug: "tpc-community-management",
    title: "Community Management Services",
    description: "Professional community management for TPC projects including Discord, Telegram, and social media platforms.",
    category: "services",
    tags: ["community", "management", "social media", "engagement"],
    featured: false,
    comingSoon: true,
  },
  {
    id: "10",
    slug: "nft-marketplace-integration",
    title: "NFT Marketplace Integration",
    description: "Integration services for NFT marketplaces to support TPC tokens and enable seamless trading experiences.",
    category: "technology",
    tags: ["nft", "marketplace", "integration", "trading"],
    featured: false,
    comingSoon: true,
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
