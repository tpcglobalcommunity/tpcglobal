/*
  # Seed initial news posts

  ## Content
  1. Welcome Post (update, pinned)
    - Introduces the News Center
    - Explains official communication channel
  
  2. Risk Disclaimer (policy)
    - Community rules and compliance
    - Safe, educational positioning
  
  3. Transparency Standard (transparency)
    - Reporting commitment
    - Open communication principles
  
  ## Notes
  - Idempotent: Only inserts if slug doesn't exist
  - All posts are published with published_at set
  - Bilingual content (EN/ID)
  - created_by is NULL (system-created)
  - Tags included for categorization
*/

-- Insert welcome post
INSERT INTO public.news_posts (
  slug,
  category,
  title_en,
  excerpt_en,
  content_en,
  title_id,
  excerpt_id,
  content_id,
  tags,
  is_pinned,
  is_published,
  published_at
)
SELECT
  'welcome-to-tpc-news',
  'update',
  'Welcome to TPC News Center',
  'Your official source for updates, education, and transparency reports from TPC Global.',
  E'We are excited to introduce the TPC News Center – your central hub for official announcements, educational content, and transparent communication from TPC Global.\n\nThis platform serves as our primary channel for:\n\n• Project updates and development milestones\n• Educational resources about blockchain and digital assets\n• Policy updates and compliance information\n• Transparency reports and community governance\n• Security announcements and best practices\n\nAll content published here represents official communication from TPC Global. We are committed to maintaining the highest standards of accuracy, transparency, and education-first principles.\n\nStay informed, stay educated, and thank you for being part of our community.',
  'Selamat Datang di Pusat Berita TPC',
  'Sumber resmi Anda untuk pembaruan, edukasi, dan laporan transparansi dari TPC Global.',
  E'Kami dengan senang hati memperkenalkan Pusat Berita TPC – pusat informasi resmi untuk pengumuman, konten edukasi, dan komunikasi transparan dari TPC Global.\n\nPlatform ini berfungsi sebagai saluran utama kami untuk:\n\n• Pembaruan proyek dan pencapaian pengembangan\n• Sumber edukasi tentang blockchain dan aset digital\n• Pembaruan kebijakan dan informasi kepatuhan\n• Laporan transparansi dan tata kelola komunitas\n• Pengumuman keamanan dan praktik terbaik\n\nSemua konten yang dipublikasikan di sini merupakan komunikasi resmi dari TPC Global. Kami berkomitmen untuk mempertahankan standar tertinggi dalam akurasi, transparansi, dan prinsip edukasi pertama.\n\nTetap terinformasi, tetap teredukasi, dan terima kasih telah menjadi bagian dari komunitas kami.',
  ARRAY['welcome', 'update', 'announcement'],
  true,
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.news_posts WHERE slug = 'welcome-to-tpc-news'
);

-- Insert risk disclaimer post
INSERT INTO public.news_posts (
  slug,
  category,
  title_en,
  excerpt_en,
  content_en,
  title_id,
  excerpt_id,
  content_id,
  tags,
  is_pinned,
  is_published,
  published_at
)
SELECT
  'risk-disclaimer-and-community-rules',
  'policy',
  'Risk Disclaimer & Community Rules',
  'Important information about digital asset risks and our community guidelines.',
  E'## Understanding Digital Asset Risks\n\nTPC Global is committed to education and transparency. All community members must understand:\n\n**Financial Risks:**\n• Digital assets are highly volatile and speculative\n• Past performance does not guarantee future results\n• Only invest what you can afford to lose\n• Conduct your own research before making decisions\n\n**No Investment Advice:**\n• TPC Global does not provide financial or investment advice\n• All information is educational only\n• Consult licensed professionals for financial guidance\n\n**Community Guidelines:**\n• Respect all community members\n• No harassment, spam, or fraudulent activity\n• No discussion of illegal activities\n• Verify information from official sources only\n\n**Official Communication:**\n• This News Center is our official platform\n• Beware of impersonators and fake accounts\n• Always verify through tpcglobal.io\n\nBy participating in our community, you acknowledge understanding these risks and agree to follow our guidelines.',
  'Penafian Risiko & Aturan Komunitas',
  'Informasi penting tentang risiko aset digital dan pedoman komunitas kami.',
  E'## Memahami Risiko Aset Digital\n\nTPC Global berkomitmen untuk edukasi dan transparansi. Semua anggota komunitas harus memahami:\n\n**Risiko Finansial:**\n• Aset digital sangat volatile dan spekulatif\n• Kinerja masa lalu tidak menjamin hasil masa depan\n• Hanya investasikan apa yang Anda mampu untuk kehilangan\n• Lakukan riset sendiri sebelum membuat keputusan\n\n**Bukan Nasihat Investasi:**\n• TPC Global tidak memberikan nasihat finansial atau investasi\n• Semua informasi hanya bersifat edukasi\n• Konsultasikan dengan profesional berlisensi untuk panduan finansial\n\n**Pedoman Komunitas:**\n• Hormati semua anggota komunitas\n• Tidak ada pelecehan, spam, atau aktivitas penipuan\n• Tidak ada diskusi tentang aktivitas ilegal\n• Verifikasi informasi hanya dari sumber resmi\n\n**Komunikasi Resmi:**\n• Pusat Berita ini adalah platform resmi kami\n• Waspada terhadap peniru dan akun palsu\n• Selalu verifikasi melalui tpcglobal.io\n\nDengan berpartisipasi dalam komunitas kami, Anda mengakui memahami risiko ini dan setuju untuk mengikuti pedoman kami.',
  ARRAY['policy', 'risk', 'compliance', 'rules'],
  false,
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.news_posts WHERE slug = 'risk-disclaimer-and-community-rules'
);

-- Insert transparency standard post
INSERT INTO public.news_posts (
  slug,
  category,
  title_en,
  excerpt_en,
  content_en,
  title_id,
  excerpt_id,
  content_id,
  tags,
  is_pinned,
  is_published,
  published_at
)
SELECT
  'transparency-reporting-standard',
  'transparency',
  'Our Transparency Reporting Standard',
  'How TPC Global maintains open communication and accountability with the community.',
  E'## Commitment to Transparency\n\nTransparency is a core principle at TPC Global. We believe our community deserves clear, honest, and timely information about all aspects of our project.\n\n**What We Report:**\n\n**Development Updates:**\n• Regular progress reports on technical development\n• Roadmap updates and milestone achievements\n• Technical challenges and solutions\n\n**Financial Transparency:**\n• Community fund allocation reports\n• DAO-Lite voting results and implementations\n• Operational cost breakdowns (when applicable)\n\n**Governance:**\n• Decision-making processes\n• Community voting outcomes\n• Policy changes and rationale\n\n**Security:**\n• Security audit results\n• Incident reports (if any)\n• Best practice recommendations\n\n**Reporting Schedule:**\n• Major updates: As they occur\n• Development progress: Monthly\n• Financial reports: Quarterly\n• Annual comprehensive review\n\n**Our Promise:**\nWe commit to honest communication, even when facing challenges. Transparency builds trust, and trust is the foundation of a strong community.\n\nAll transparency reports will be published here in the News Center and remain permanently accessible.',
  'Standar Pelaporan Transparansi Kami',
  'Bagaimana TPC Global mempertahankan komunikasi terbuka dan akuntabilitas dengan komunitas.',
  E'## Komitmen untuk Transparansi\n\nTransparansi adalah prinsip inti di TPC Global. Kami percaya komunitas kami berhak mendapat informasi yang jelas, jujur, dan tepat waktu tentang semua aspek proyek kami.\n\n**Apa yang Kami Laporkan:**\n\n**Pembaruan Pengembangan:**\n• Laporan kemajuan reguler tentang pengembangan teknis\n• Pembaruan roadmap dan pencapaian milestone\n• Tantangan teknis dan solusi\n\n**Transparansi Finansial:**\n• Laporan alokasi dana komunitas\n• Hasil voting DAO-Lite dan implementasi\n• Rincian biaya operasional (jika berlaku)\n\n**Tata Kelola:**\n• Proses pengambilan keputusan\n• Hasil voting komunitas\n• Perubahan kebijakan dan alasannya\n\n**Keamanan:**\n• Hasil audit keamanan\n• Laporan insiden (jika ada)\n• Rekomendasi praktik terbaik\n\n**Jadwal Pelaporan:**\n• Pembaruan besar: Saat terjadi\n• Kemajuan pengembangan: Bulanan\n• Laporan finansial: Kuartalan\n• Tinjauan komprehensif tahunan\n\n**Janji Kami:**\nKami berkomitmen untuk komunikasi yang jujur, bahkan saat menghadapi tantangan. Transparansi membangun kepercayaan, dan kepercayaan adalah fondasi komunitas yang kuat.\n\nSemua laporan transparansi akan dipublikasikan di Pusat Berita ini dan tetap dapat diakses secara permanen.',
  ARRAY['transparency', 'reporting', 'accountability', 'governance'],
  false,
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.news_posts WHERE slug = 'transparency-reporting-standard'
);