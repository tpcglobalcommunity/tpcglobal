import fs from 'fs';
import path from 'path';

const generateHTML = (lang) => {
  const content = lang === 'en' ? {
    title: "What TPC Is",
    description: "Trader Professional Community (TPC) is an education-first community and platform focused on trading discipline, transparency, and collaboration among traders. TPC is designed to support learning processes, risk management, and the development of a transparent, technology-driven community ecosystem. TPC prioritizes education, on-chain verification, and public transparency.",
    notTitle: "What TPC Is NOT",
    notDescription: "TPC is not:\n\nAn investment product\n\nAn investment contract or profit-sharing program\n\nA platform that guarantees profits or future value\n\nAn entity that contacts users via private messages\n\nTPC does not provide financial advice and does not promise any returns.",
    verifyTitle: "How to Verify TPC",
    verifyDescription: "To verify official information:\n\nUse only the official TPC website\n\nCheck wallet addresses on the Verified and Transparency pages\n\nAll purchases and invoice tracking are done directly on the website\n\nTPC will never request payments or data through private messages.",
    presaleTitle: "Presale Basics (Informational)",
    presaleDescription: "Stage 1: 100,000,000 TPC — price $0.001\n\nStage 2: 100,000,000 TPC — price $0.002\n\nListing reference: $0.005 (informational only, not a promise)\n\nPresale stages and pricing are transparent. No future value is guaranteed.",
    safetyTitle: "Safety Checklist",
    safetyDescription: "Access TPC only via the official website\n\nIgnore private messages claiming to represent TPC\n\nTrack invoices and status directly on the website\n\nVerify wallets only on official pages",
    footerDisclaimer: "Education-Only • No Financial Advice • High Risk\nTPC is intended for education and community development, not speculation or profit guarantees."
  } : {
    title: "What TPC Is",
    description: "Trader Professional Community (TPC) adalah komunitas dan platform edukasi yang berfokus pada disiplin trading, transparansi, dan kolaborasi antar trader. TPC dibangun untuk mendukung proses belajar, pengelolaan risiko, dan pengembangan ekosistem komunitas berbasis teknologi. TPC mengedepankan education-first, keterbukaan data, dan verifikasi on-chain untuk membangun kepercayaan publik.",
    notTitle: "What TPC Is NOT",
    notDescription: "TPC bukan:\n\nProduk investasi\n\nKontrak investasi atau program profit sharing\n\nPlatform yang menjanjikan keuntungan atau hasil tertentu\n\nPihak yang menghubungi pengguna melalui chat pribadi (DM/WA/Telegram)\n\nTPC tidak memberikan nasihat keuangan dan tidak menjanjikan nilai di masa depan.",
    verifyTitle: "How to Verify TPC",
    verifyDescription: "Untuk memastikan keaslian informasi:\n\nGunakan hanya website resmi TPC\n\nVerifikasi alamat wallet melalui halaman Verified dan Transparency\n\nSemua proses pembelian dan pengecekan invoice dilakukan langsung di website\n\nTPC tidak pernah meminta data atau pembayaran melalui chat pribadi.",
    presaleTitle: "Presale Basics (Informational)",
    presaleDescription: "Stage 1: 100.000.000 TPC — harga $0.001\n\nStage 2: 100.000.000 TPC — harga $0.002\n\nReferensi listing: $0.005 (informasi saja, bukan janji nilai)\n\nHarga dan tahap presale bersifat transparan. Tidak ada jaminan nilai di masa depan.",
    safetyTitle: "Safety Checklist",
    safetyDescription: "Akses hanya melalui website resmi TPC\n\nAbaikan pesan pribadi yang mengatasnamakan TPC\n\nCek invoice dan status langsung di website\n\nVerifikasi wallet hanya di halaman resmi",
    footerDisclaimer: "Education-Only • No Financial Advice • High Risk\nTPC ditujukan untuk edukasi dan pengembangan komunitas, bukan untuk spekulasi atau janji keuntungan."
  };

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPC One-Pager - ${lang.toUpperCase()}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; background: #ffffff; max-width: 800px; margin: 0 auto; padding: 40px; }
        h1 { font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 40px; color: #1a1a1a; }
        h2 { font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #1a1a1a; }
        p { font-size: 16px; margin-bottom: 15px; text-align: justify; }
        .section { margin-bottom: 30px; }
        .urls { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .urls p { font-weight: 600; margin-bottom: 10px; }
        .urls a { color: #0066cc; text-decoration: none; }
        .urls a:hover { text-decoration: underline; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e1e1e1; }
        .footer p { text-align: center; font-style: italic; color: #666; font-size: 14px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <h1>Trader Professional Community (TPC)</h1>
    <div class="section">
        <h2>${content.title}</h2>
        <p>${content.description}</p>
    </div>
    <div class="section">
        <h2>${content.notTitle}</h2>
        <p style="white-space: pre-line;">${content.notDescription}</p>
    </div>
    <div class="section">
        <h2>${content.verifyTitle}</h2>
        <p style="white-space: pre-line;">${content.verifyDescription}</p>
        <div class="urls">
            <p>${lang === 'en' ? 'Official Verification URLs:' : 'URL Verifikasi Resmi:'}</p>
            <p><a href="https://tpcglobal.io/verified">https://tpcglobal.io/verified</a></p>
            <p><a href="https://tpcglobal.io/transparency">https://tpcglobal.io/transparency</a></p>
        </div>
    </div>
    <div class="section">
        <h2>${content.presaleTitle}</h2>
        <p style="white-space: pre-line;">${content.presaleDescription}</p>
    </div>
    <div class="section">
        <h2>${content.safetyTitle}</h2>
        <p style="white-space: pre-line;">${content.safetyDescription}</p>
    </div>
    <div class="footer">
        <p>${content.footerDisclaimer}</p>
    </div>
</body>
</html>`;
};

const main = () => {
  console.log('📄 Generating one-pager HTML files...');
  try {
    const enHTML = generateHTML('en');
    const enPath = path.join(process.cwd(), 'public', 'one-pager-en.html');
    fs.writeFileSync(enPath, enHTML);
    console.log(`✅ Generated: ${enPath}`);
    
    const idHTML = generateHTML('id');
    const idPath = path.join(process.cwd(), 'public', 'one-pager-id.html');
    fs.writeFileSync(idPath, idHTML);
    console.log(`✅ Generated: ${idPath}`);
    
    console.log('🎉 One-pager files generated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
