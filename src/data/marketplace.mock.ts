export type MarketplaceCategory = "all"|"trading"|"education"|"services"|"technology"|"consulting"|"media"|"other";

export interface MarketplaceItem {
  id: string;
  category: MarketplaceCategory;
  verified: boolean;
  slug?: string;
  title: {
    en: string;
    id: string;
  };
  desc: {
    en: string;
    id: string;
  };
  shortDesc: {
    en: string;
    id: string;
  };
  priceLabel: {
    en: string;
    id: string;
  };
  badges: string[];
  rating: number;
  reviewCount: number;
  coverIcon: string;
  updatedAt: string;
  provider: {
    name: string;
    verified: boolean;
    since: string;
  };
  features: {
    en: string[];
    id: string[];
  };
  requirements: {
    en: string[];
    id: string[];
  };
  tags: string[];
}

export const marketplaceItems: MarketplaceItem[] = [
  {
    id: "demo-robot-01",
    category: "trading",
    verified: true,
    title: {
      en: "Algo Trading Robot Pro",
      id: "Robot Trading Algo Pro"
    },
    desc: {
      en: "Advanced algorithmic trading system with AI-powered market analysis and automated execution capabilities. Built for professional traders seeking consistent returns.",
      id: "Sistem trading algoritmik canggih dengan analisis pasar AI dan eksekusi otomatis. Dibuat untuk trader profesional yang mencari keuntungan konsisten."
    },
    shortDesc: {
      en: "AI-powered automated trading with advanced market analysis",
      id: "Trading otomatis dengan analisis pasar AI canggih"
    },
    priceLabel: {
      en: "From $299/mo",
      id: "Mulai $299/bulan"
    },
    badges: ["Verified", "Popular", "AI-Powered"],
    rating: 4.9,
    reviewCount: 284,
    coverIcon: "",
    updatedAt: "2024-01-15",
    provider: {
      name: "TPC Trading Labs",
      verified: true,
      since: "2021"
    },
    features: {
      en: [
        "AI-powered market analysis",
        "Automated trade execution",
        "Risk management system",
        "Backtesting engine",
        "Real-time monitoring",
        "Multi-exchange support",
        "Custom strategy builder",
        "Performance analytics"
      ],
      id: [
        "Analisis pasar AI-powered",
        "Eksekusi trading otomatis",
        "Sistem manajemen risiko",
        "Mesin backtesting",
        "Monitoring real-time",
        "Support multi-exchange",
        "Builder strategi kustom",
        "Analitik performa"
      ]
    },
    requirements: {
      en: [
        "Minimum $10,000 trading capital",
        "Basic programming knowledge",
        "Verified TPC membership",
        "Risk management understanding"
      ],
      id: [
        "Modal trading minimal $10.000",
        "Pengetahuan pemrograman dasar",
        "Keanggotaan TPC terverifikasi",
        "Pemahaman manajemen risiko"
      ]
    },
    tags: ["algorithmic", "automation", "AI", "professional"]
  },
  {
    id: "trading-mastery-02",
    category: "education",
    verified: false,
    title: {
      en: "Trading Mastery Course",
      id: "Kursus Penguasaan Trading"
    },
    desc: {
      en: "Comprehensive trading education program covering technical analysis, risk management, trading psychology, and practical application. Includes live trading sessions and mentorship.",
      id: "Program edukasi trading komprehensif mencakup analisis teknikal, manajemen risiko, psikologi trading, dan aplikasi praktis. Termasuk sesi trading live dan mentorship."
    },
    shortDesc: {
      en: "Complete trading education with live sessions",
      id: "Edukasi trading lengkap dengan sesi live"
    },
    priceLabel: {
      en: "From $199/mo",
      id: "Mulai $199/bulan"
    },
    badges: ["Bestseller", "Beginner Friendly"],
    rating: 4.8,
    reviewCount: 512,
    coverIcon: "",
    updatedAt: "2024-01-10",
    provider: {
      name: "TPC Academy",
      verified: true,
      since: "2020"
    },
    features: {
      en: [
        "50+ video lessons",
        "Live trading sessions",
        "Weekly market analysis",
        "Personal mentorship",
        "Trading psychology course",
        "Risk management module",
        "Community access",
        "Certificate of completion"
      ],
      id: [
        "50+ pelajaran video",
        "Sesi trading live",
        "Analisis pasar mingguan",
        "Mentorship personal",
        "Kursus psikologi trading",
        "Modul manajemen risiko",
        "Akses komunitas",
        "Sertifikat kelulusan"
      ]
    },
    requirements: {
      en: [
        "Basic trading knowledge",
        "Dedication to learning",
        "Internet connection",
        "Note-taking capability"
      ],
      id: [
        "Pengetahuan trading dasar",
        "Dedikasi untuk belajar",
        "Koneksi internet",
        "Kemampuan mencatat"
      ]
    },
    tags: ["education", "beginner", "comprehensive", "certified"]
  },
  {
    id: "risk-template-03",
    category: "services",
    verified: true,
    title: {
      en: "Risk Management Template",
      id: "Template Manajemen Risiko"
    },
    desc: {
      en: "Professional risk management template system with position sizing calculators, correlation analysis, and portfolio optimization tools. Essential for serious traders.",
      id: "Sistem template manajemen risiko profesional dengan kalkulator ukuran posisi, analisis korelasi, dan alat optimasi portofolio. Esensial untuk trader serius."
    },
    shortDesc: {
      en: "Professional risk management system for traders",
      id: "Sistem manajemen risiko profesional untuk trader"
    },
    priceLabel: {
      en: "From $79/mo",
      id: "Mulai $79/bulan"
    },
    badges: ["Essential", "Professional"],
    rating: 4.7,
    reviewCount: 156,
    coverIcon: "",
    updatedAt: "2024-01-12",
    provider: {
      name: "TPC Risk Solutions",
      verified: true,
      since: "2022"
    },
    features: {
      en: [
        "Position sizing calculator",
        "Risk/reward analysis",
        "Correlation matrix",
        "Portfolio optimizer",
        "Stress testing tools",
        "Drawdown analysis",
        "Risk metrics dashboard",
        "Alert system"
      ],
      id: [
        "Kalkulator ukuran posisi",
        "Analisis risiko/imbal hasil",
        "Matriks korelasi",
        "Optimisasi portofolio",
        "Alat stress testing",
        "Analisis drawdown",
        "Dashboard metrik risiko",
        "Sistem alert"
      ]
    },
    requirements: {
      en: [
        "Trading experience required",
        "Portfolio to analyze",
        "Basic statistics knowledge",
        "Risk management understanding"
      ],
      id: [
        "Pengalaman trading diperlukan",
        "Portofolio untuk dianalisis",
        "Pengetahuan statistik dasar",
        "Pemahaman manajemen risiko"
      ]
    },
    tags: ["risk", "essential", "professional", "tools"]
  },
  {
    id: "chart-indicators-04",
    category: "technology",
    verified: true,
    title: {
      en: "Chart Indicator Pack",
      id: "Paket Indikator Chart"
    },
    desc: {
      en: "Premium collection of technical indicators and charting tools for professional trading analysis. Includes custom indicators, drawing tools, and real-time data visualization.",
      id: "Koleksi indikator dan alat charting premium untuk analisis trading profesional. Termasuk indikator kustom, alat menggambar, dan visualisasi data real-time."
    },
    shortDesc: {
      en: "Technical indicators and charting tools",
      id: "Indikator teknis dan alat charting"
    },
    priceLabel: {
      en: "From $49/mo",
      id: "Mulai $49/bulan"
    },
    badges: ["Technical", "Developer"],
    rating: 4.6,
    reviewCount: 89,
    coverIcon: "",
    updatedAt: "2024-01-08",
    provider: {
      name: "TPC Tech Solutions",
      verified: true,
      since: "2022"
    },
    features: {
      en: [
        "50+ technical indicators",
        "Custom indicator builder",
        "Real-time charting",
        "Drawing tools",
        "Alert notifications",
        "Multi-timeframe analysis",
        "Export capabilities",
        "API integration"
      ],
      id: [
        "50+ indikator teknis",
        "Builder indikator kustom",
        "Charting real-time",
        "Alat menggambar",
        "Notifikasi alert",
        "Analisis multi-timeframe",
        "Kemampuan ekspor",
        "Integrasi API"
      ]
    },
    requirements: {
      en: [
        "Technical analysis knowledge",
        "Charting software",
        "API understanding",
        "Development experience"
      ],
      id: [
        "Pengetahuan analisis teknikal",
        "Software charting",
        "Pemahaman API",
        "Pengalaman development"
      ]
    },
    tags: ["technical", "indicators", "charting", "analysis"]
  },
  {
    id: "mentoring-05",
    category: "consulting",
    verified: false,
    title: {
      en: "1-on-1 Trading Mentorship",
      id: "Mentorship Trading 1-on-1"
    },
    desc: {
      en: "Personalized trading mentorship from expert traders with proven track records. Includes strategy development, performance review, and ongoing guidance for trading success.",
      id: "Mentorship trading personal dari trader ahli dengan track record terbukti. Termasuk pengembangan strategi, review performa, dan bimbingan berkelanjutan untuk kesukses trading."
    },
    shortDesc: {
      en: "Personal mentorship from expert traders",
      id: "Mentorship dari trader ahli"
    },
    priceLabel: {
      en: "From $500/session",
      id: "Mulai $500/sesi"
    },
    badges: ["Premium", "Expert", "Limited"],
    rating: 5.0,
    reviewCount: 67,
    coverIcon: "",
    updatedAt: "2024-01-20",
    provider: {
      name: "TPC Elite Mentors",
      verified: true,
      since: "2019"
    },
    features: {
      en: [
        "Personal strategy development",
        "Performance review",
        "Risk assessment",
        "Psychology coaching",
        "Accountability partnership",
        "24/7 support",
        "Resource library access",
        "Networking opportunities"
      ],
      id: [
        "Pengembangan strategi personal",
        "Review performa",
        "Asesmen risiko",
        "Coaching psikologi",
        "Kemitraan akuntabilitas",
        "Support 24/7",
        "Akses perpustakaan",
        "Peluang networking"
      ]
    },
    requirements: {
      en: [
        "Intermediate trading experience",
        "Portfolio to analyze",
        "Commitment to improvement",
        "Interview process"
      ],
      id: [
        "Pengalaman trading menengah",
        "Portofolio untuk dianalisis",
        "Komitmen untuk perbaikan",
        "Proses interview"
      ]
    },
    tags: ["mentoring", "expert", "personal", "premium"]
  },
  {
    id: "signal-room-06",
    category: "trading",
    verified: true,
    title: {
      en: "Signal Room Access",
      id: "Akses Signal Room"
    },
    desc: {
      en: "Exclusive trading signal room with professional analysts sharing real-time trade ideas, market analysis, and entry/exit points. High success rate with transparent track record.",
      id: "Ruang signal trading eksklusif dengan analis profesional berbagi ide trading real-time, analisis pasar, dan titik entry/exit. Tingkat keberhasilan tinggi dengan track record transparan."
    },
    shortDesc: {
      en: "Professional trading signals with high success rate",
      id: "Signal trading profesional dengan tingkat keberhasilan tinggi"
    },
    priceLabel: {
      en: "From $149/mo",
      id: "Mulai $149/bulan"
    },
    badges: ["Verified", "Live", "Popular"],
    rating: 4.6,
    reviewCount: 203,
    coverIcon: "",
    updatedAt: "2024-01-18",
    provider: {
      name: "TPC Signals Group",
      verified: true,
      since: "2019"
    },
    features: {
      en: [
        "Daily trading signals",
        "Entry/exit points",
        "Risk/reward ratios",
        "Market analysis",
        "Performance tracking",
        "Mobile app access",
        "Community chat",
        "Signal history"
      ],
      id: [
        "Signal trading harian",
        "Titik entry/exit",
        "Rasio risiko/imbal hasil",
        "Analisis pasar",
        "Pelacakan performa",
        "Akses aplikasi mobile",
        "Chat komunitas",
        "Riwayat signal"
      ]
    },
    requirements: {
      en: [
        "Basic trading knowledge",
        "Ability to follow signals",
        "Risk capital available",
        "Discipline required"
      ],
      id: [
        "Pengetahuan trading dasar",
        "Kemampuan mengikuti signal",
        "Modal risiko tersedia",
        "Disiplin diperlukan"
      ]
    },
    tags: ["signals", "live", "community", "professional"]
  },
  {
    id: "community-tools-07",
    category: "other",
    verified: false,
    title: {
      en: "Community Tools Suite",
      id: "Paket Tools Komunitas"
    },
    desc: {
      en: "Comprehensive suite of community tools including member directory, referral tracking, analytics dashboard, and collaborative features for TPC community members.",
      id: "Paket lengkap tools komunitas termasuk direktori member, pelacakan referral, dashboard analitik, dan fitur kolaboratif untuk member TPC."
    },
    shortDesc: {
      en: "Community management and analytics tools",
      id: "Tools manajemen dan analitik komunitas"
    },
    priceLabel: {
      en: "From $29/mo",
      id: "Mulai $29/bulan"
    },
    badges: ["Community", "Essential"],
    rating: 4.4,
    reviewCount: 298,
    coverIcon: "",
    updatedAt: "2024-01-05",
    provider: {
      name: "TPC Community",
      verified: true,
      since: "2019"
    },
    features: {
      en: [
        "Member directory",
        "Referral tracking",
        "Analytics dashboard",
        "Collaboration tools",
        "Event management",
        "Resource library",
        "Discussion forums",
        "Private messaging"
      ],
      id: [
        "Direktori member",
        "Pelacakan referral",
        "Dashboard analitik",
        "Alat kolaborasi",
        "Manajemen event",
        "Perpustakaan sumber daya",
        "Forum diskusi",
        "Pesan private"
      ]
    },
    requirements: {
      en: [
        "TPC membership",
        "Active participation",
        "Community guidelines agreement"
      ],
      id: [
        "Keanggotaan TPC",
        "Partisipasi aktif",
        "Persetujuan panduan komunitas"
      ]
    },
    tags: ["community", "tools", "analytics", "collaboration"]
  },
  {
    id: "content-media-08",
    category: "media",
    verified: true,
    title: {
      en: "Content & Media Package",
      id: "Paket Konten & Media"
    },
    desc: {
      en: "Complete content creation and media package including video production, social media management, content strategy, and distribution across multiple platforms for trading education.",
      id: "Paket lengkap pembuatan konten dan media termasuk produksi video, manajemen media sosial, strategi konten, dan distribusi ke multiple platform untuk edukasi trading."
    },
    shortDesc: {
      en: "Content creation and media management",
      id: "Pembuatan konten dan manajemen media"
    },
    priceLabel: {
      en: "From $99/mo",
      id: "Mulai $99/bulan"
    },
    badges: ["Creative", "Professional"],
    rating: 4.5,
    reviewCount: 156,
    coverIcon: "",
    updatedAt: "2024-01-22",
    provider: {
      name: "TPC Media Hub",
      verified: true,
      since: "2021"
    },
    features: {
      en: [
        "Video production",
        "Social media management",
        "Content strategy",
        "Multi-platform distribution",
        "Analytics reporting",
        "Brand guidelines",
        "Content calendar",
        "Creative assets library"
      ],
      id: [
        "Produksi video",
        "Manajemen media sosial",
        "Strategi konten",
        "Distribusi multi-platform",
        "Laporan analitik",
        "Panduan merek",
        "Kalender konten",
        "Aset kreatif"
      ]
    },
    requirements: {
      en: [
        "Content creation experience",
        "Social media knowledge",
        "Creative mindset",
        "Communication skills"
      ],
      id: [
        "Pengalaman pembuatan konten",
        "Pengetahuan media sosial",
        "Mindset kreatif",
        "Kemampuan komunikasi"
      ]
    },
    tags: ["content", "media", "creative", "marketing"]
  },
  {
    id: "prop-firm-prep-09",
    category: "education",
    verified: false,
    title: {
      en: "Prop Firm Preparation",
      id: "Persiapan Prop Firm"
    },
    desc: {
      en: "Complete preparation program for proprietary trading firm interviews including technical questions, case studies, mock trading, and interview coaching from industry professionals.",
      id: "Program persiapan lengkap untuk wawancara perusahaan trading proprietary termasuk pertanyaan teknis, studi kasus, trading simulasi, dan coaching dari profesional industri."
    },
    shortDesc: {
      en: "Prop firm interview preparation program",
      id: "Program persiapan wawancara prop firm"
    },
    priceLabel: {
      en: "From $399",
      id: "Mulai $399"
    },
    badges: ["Career", "Professional", "Limited"],
    rating: 4.8,
    reviewCount: 92,
    coverIcon: "",
    updatedAt: "2024-01-25",
    provider: {
      name: "TPC Career Services",
      verified: true,
      since: "2020"
    },
    features: {
      en: [
        "Technical interview prep",
        "Case study analysis",
        "Mock trading simulations",
        "Interview coaching",
        "Resume review",
        "Network connections",
        "Industry insights",
        "Career guidance",
        "Follow-up support"
      ],
      id: [
        "Persiapan wawancara teknis",
        "Analisis studi kasus",
        "Simulasi trading",
        "Coaching wawancara",
        "Review resume",
        "Koneksi networking",
        "Insight industri",
        "Bimbingan karir",
        "Dukungan lanjutan"
      ]
    },
    requirements: {
      en: [
        "Trading experience required",
        "Educational background",
        "Career goals clarity",
        "Interview preparation needed"
      ],
      id: [
        "Pengalaman trading diperlukan",
        "Latar belakang pendidikan",
        "Tujuan karir jelas",
        "Persiapan wawancara diperlukan"
      ]
    },
    tags: ["career", "interview", "professional", "firm"]
  },
  {
    id: "api-service-10",
    category: "services",
    verified: true,
    title: {
      en: "API Integration Service",
      id: "Layanan Integrasi API"
    },
    desc: {
      en: "Complete API integration service for trading platforms, exchanges, and financial applications. Includes REST API, WebSocket support, and comprehensive documentation.",
      id: "Layanan integrasi API lengkap untuk platform trading, exchange, dan aplikasi keuangan. Termasuk REST API, support WebSocket, dan dokumentasi lengkap."
    },
    shortDesc: {
      en: "API integration for trading platforms",
      id: "Integrasi API untuk platform trading"
    },
    priceLabel: {
      en: "From $399/mo",
      id: "Mulai $399/bulan"
    },
    badges: ["Technical", "Enterprise"],
    rating: 4.4,
    reviewCount: 43,
    coverIcon: "",
    updatedAt: "2024-01-14",
    provider: {
      name: "TPC Dev Labs",
      verified: true,
      since: "2022"
    },
    features: {
      en: [
        "REST API development",
        "WebSocket support",
        "Documentation",
        "Testing framework",
        "Cloud deployment",
        "Security audit",
        "Performance optimization",
        "Maintenance support"
      ],
      id: [
        "Pengembangan REST API",
        "Support WebSocket",
        "Dokumentasi",
        "Framework testing",
        "Deployment cloud",
        "Audit keamanan",
        "Optimasi performa",
        "Support pemeliharaan"
      ]
    },
    requirements: {
      en: [
        "Development experience",
        "API knowledge",
        "Technical infrastructure",
        "Project requirements"
      ],
      id: [
        "Pengalaman development",
        "Pengetahuan API",
        "Infrastruktur teknis",
        "Persyaratan proyek"
      ]
    },
    tags: ["api", "integration", "technical", "enterprise"]
  }
];

export function getMarketplaceItemById(id: string): MarketplaceItem | undefined {
  return marketplaceItems.find(item => item.id === id);
}

export function getMarketplaceItemsByCategory(category: MarketplaceCategory): MarketplaceItem[] {
  if (category === 'all') {
    return marketplaceItems;
  }
  return marketplaceItems.filter(item => item.category === category);
}
