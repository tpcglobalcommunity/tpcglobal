import fs from 'fs';
import path from 'path';

const createPDF = (lang) => {
  console.log(`📄 Creating ${lang} one-pager PDF...`);
  
  const content = lang === 'en' ? {
    title: "What TPC Is",
    description: "Trader Professional Community (TPC) is an education-first community and platform focused on trading discipline, transparency, and collaboration among traders. TPC is designed to support learning processes, risk management, and the development of a transparent, technology-driven community ecosystem. TPC prioritizes education, on-chain verification, and public transparency.",
    notTitle: "What TPC Is NOT",
    notDescription: `TPC is not:

• An investment product
• An investment contract or profit-sharing program  
• A platform that guarantees profits or future value
• An entity that contacts users via private messages

TPC does not provide financial advice and does not promise any returns.`,
    verifyTitle: "How to Verify TPC",
    verifyDescription: `To verify official information:

• Use only the official TPC website
• Check wallet addresses on the Verified and Transparency pages
• All purchases and invoice tracking are done directly on the website
• TPC will never request payments or data through private messages.

Official Verification URLs:
https://tpcglobal.io/verified
https://tpcglobal.io/transparency`,
    presaleTitle: "Presale Basics (Informational)",
    presaleDescription: `Stage 1: 100,000,000 TPC — price $0.001
Stage 2: 100,000,000 TPC — price $0.002
Listing reference: $0.005 (informational only, not a promise)

Presale stages and pricing are transparent. No future value is guaranteed.`,
    safetyTitle: "Safety Checklist",
    safetyDescription: `• Access TPC only via the official website
• Ignore private messages claiming to represent TPC
• Track invoices and status directly on the website
• Verify wallets only on official pages`,
    footerDisclaimer: "Education-Only • No Financial Advice • High Risk\nTPC is intended for education and community development, not speculation or profit guarantees."
  } : {
    title: "What TPC Is",
    description: "Trader Professional Community (TPC) adalah komunitas dan platform edukasi yang berfokus pada disiplin trading, transparansi, dan kolaborasi antar trader. TPC dibangun untuk mendukung proses belajar, pengelolaan risiko, dan pengembangan ekosistem komunitas berbasis teknologi. TPC mengedepankan education-first, keterbukaan data, dan verifikasi on-chain untuk membangun kepercayaan publik.",
    notTitle: "What TPC Is NOT",
    notDescription: `TPC bukan:

• Produk investasi
• Kontrak investasi atau program profit sharing
• Platform yang menjanjikan keuntungan atau hasil tertentu
• Pihak yang menghubungi pengguna melalui chat pribadi (DM/WA/Telegram)

TPC tidak memberikan nasihat keuangan dan tidak menjanjikan nilai di masa depan.`,
    verifyTitle: "How to Verify TPC",
    verifyDescription: `Untuk memastikan keaslian informasi:

• Gunakan hanya website resmi TPC
• Verifikasi alamat wallet melalui halaman Verified dan Transparency
• Semua proses pembelian dan pengecekan invoice dilakukan langsung di website
• TPC tidak pernah meminta data atau pembayaran melalui chat pribadi.

URL Verifikasi Resmi:
https://tpcglobal.io/verified
https://tpcglobal.io/transparency`,
    presaleTitle: "Presale Basics (Informational)",
    presaleDescription: `Stage 1: 100.000.000 TPC — harga $0.001
Stage 2: 100.000.000 TPC — harga $0.002
Referensi listing: $0.005 (informasi saja, bukan janji nilai)

Harga dan tahap presale bersifat transparan. Tidak ada jaminan nilai di masa depan.`,
    safetyTitle: "Safety Checklist",
    safetyDescription: `• Akses hanya melalui website resmi TPC
• Abaikan pesan pribadi yang mengatasnamakan TPC
• Cek invoice dan status langsung di website
• Verifikasi wallet hanya di halaman resmi`,
    footerDisclaimer: "Education-Only • No Financial Advice • High Risk\nTPC ditujukan untuk edukasi dan pengembangan komunitas, bukan untuk spekulasi atau janji keuntungan."
  };

  const pdfContent = `
================================================================================
TRADER PROFESSIONAL COMMUNITY (TPC) - ONE-PAGER
================================================================================

${content.title}
--------------------------------------------------------------------------------
${content.description}

${content.notTitle}
--------------------------------------------------------------------------------
${content.notDescription}

${content.verifyTitle}
--------------------------------------------------------------------------------
${content.verifyDescription}

${content.presaleTitle}
--------------------------------------------------------------------------------
${content.presaleDescription}

${content.safetyTitle}
--------------------------------------------------------------------------------
${content.safetyDescription}

================================================================================
${content.footerDisclaimer}
================================================================================

Generated: ${new Date().toISOString()}
Language: ${lang.toUpperCase()}
Source: i18n onePager section (exact copy, no content change)
================================================================================
`;

  const pdfPath = path.join(process.cwd(), 'public', `one-pager-${lang}.pdf`);
  fs.writeFileSync(pdfPath, pdfContent);
  console.log(`✅ Created: ${pdfPath}`);
};

const main = () => {
  console.log('📄 Creating one-pager PDF files...');
  try {
    createPDF('en');
    createPDF('id');
    console.log('🎉 PDF files created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
