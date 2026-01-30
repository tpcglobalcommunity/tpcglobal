export type LegalTabKey = 'terms' | 'risk' | 'disclaimer';

export const legalContent: Record<
  'en' | 'id',
  Record<LegalTabKey, { title: string; body: string }>
> = {
  en: {
    terms: {
      title: 'Terms & Conditions',
      body: `
Last Updated: January 2026

1) ABSOLUTE NATURE OF TPC
TPC (Trader Professional Community) is STRICTLY an education and utility platform. TPC is NOT:
- An investment platform
- Financial advisory service
- Profit-sharing program
- Trading signal provider
- Guarantee of returns

TPC provides ONLY educational content and utility services.

2) ZERO FINANCIAL ADVICE
ABSOLUTELY NO financial, investment, or trading advice is provided. All content is for educational purposes ONLY. Users MUST consult qualified financial professionals before any financial decisions.

3) UTILITY TOKEN ONLY
TPC token is EXCLUSIVELY a utility token for platform access. It is NOT:
- An investment contract
- A security
- A profit-sharing instrument
- A guarantee of future value

4) EXTREME RISK WARNING
Digital assets involve COMPLETE risk of loss. You may lose 100% of your funds. Past performance provides ZERO indication of future results.

5) USER SOLE RESPONSIBILITY
You are 100% responsible for:
- All financial decisions and losses
- Securing your own digital assets
- Verifying all transaction details
- Compliance with all applicable laws

6) NO GUARANTEES WHATSOEVER
TPC provides NO guarantees regarding:
- Token value or price movement
- Platform functionality or availability
- Future development or features
- Any form of return or profit

7) FINAL TRANSACTIONS
All transactions are IRREVERSIBLE and FINAL. No refunds, no cancellations, no exceptions. You bear full responsibility for all transaction errors.

8) LEGAL COMPLIANCE
You must comply with all laws in your jurisdiction. TPC provides no legal or tax advice. Non-compliance may result in legal consequences.

9) NO PROFESSIONAL RELATIONSHIP
No professional relationship, fiduciary duty, or trust relationship exists between you and TPC.

10) INDEMNIFICATION
You agree to indemnify and hold harmless TPC from any and all claims, losses, or damages arising from your use of the platform.

11) GOVERNING LAW
These terms are governed by Indonesian law. Disputes will be resolved in Indonesian courts.

12) ACKNOWLEDGMENT
By using this platform, you ACKNOWLEDGE that you understand and accept all risks, that you may lose your entire investment, and that TPC is not responsible for any losses.
`.trim(),
    },
    risk: {
      title: 'Risk Disclosure',
      body: `
EXTREME RISK WARNING - READ CAREFULLY

Digital asset participation carries CATASTROPHIC RISK including:

• 100% LOSS of entire investment possible
• Extreme price volatility - prices can drop to ZERO
• No regulatory protection or insurance
• Permanent loss from technical errors
• Hacking, theft, and security breaches
• Exchange failures and insolvency
• Regulatory bans or restrictions
• Tax and legal complications

ABSOLUTE TRUTHS:
- You CAN lose everything
- NO ONE can guarantee profits
- Past performance MEANS NOTHING
- Technology CAN and DOES fail
- Markets ARE manipulated

CRITICAL WARNINGS:
- Only invest what you can afford to lose COMPLETELY
- You are 100% responsible for your decisions
- No one will bail you out if you lose money
- Crypto markets are HIGHLY speculative

BY PROCEEDING, YOU CONFIRM:
- You understand these EXTREME risks
- You can afford TOTAL loss
- You will NOT hold TPC responsible
- You are acting at your OWN SOLE RISK

THIS IS NOT INVESTMENT ADVICE.
`.trim(),
    },
    disclaimer: {
      title: 'Disclaimer',
      body: `
ABSOLUTE DISCLAIMER - EDUCATION ONLY

TPC provides ONLY educational and informational content.

NOTHING on this platform constitutes:
❌ Financial advice
❌ Investment advice  
❌ Trading advice
❌ Profit guarantees
❌ Investment recommendations
❌ Future price predictions

TRUTH ABOUT TPC:
- Education-first platform ONLY
- NO profit guarantees whatsoever
- NO financial services provided
- Utility token for platform access ONLY

USER RESPONSIBILITY:
- You are 100% responsible for ALL decisions
- You bear 100% of ALL risks
- You must conduct OWN research
- You must seek PROFESSIONAL advice

LEGAL REALITY:
- TPC is NOT your financial advisor
- NO professional relationship exists
- NO fiduciary duty is owed
- You CANNOT hold TPC responsible for losses

RISK ACKNOWLEDGMENT:
Digital assets can become WORTHLESS. You may lose EVERYTHING. This is NOT a game.

FINAL WARNING:
If you are looking for profits, guarantees, or financial advice, this platform is NOT for you.
`.trim(),
    },
  },
  id: {
    terms: {
      title: 'Syarat & Ketentuan',
      body: `
Terakhir diperbarui: Januari 2026

1) SIFAT MUTLAK TPC
TPC (Trader Professional Community) SANGAT STRICT platform edukasi dan utilitas. TPC BUKAN:
- Platform investasi
- Layanan nasihat keuangan
- Program bagi hasil
- Penyedia sinyal trading
- Jaminan keuntungan

TPC HANYA menyediakan konten edukasi dan layanan utilitas.

2) NOL SARAN KEUANGAN
SAMA SEKALI TIDAK ada saran keuangan, investasi, atau trading. Semua konten HANYA untuk tujuan edukasi. Pengguna HARUS berkonsultasi dengan profesional keuangan berkualifikasi sebelum keputusan finansial apa pun.

3) TOKEN UTILITAS SAJA
Token TPC EKSKLUSIF token utilitas untuk akses platform. Ini BUKAN:
- Kontrak investasi
- Sekuritas
- Instrumen bagi hasil
- Jaminan nilai masa depan

4) PERINGATAN RISIKO EKSTREM
Aset digital melibatkan risiko KEHILANGAN TOTAL. Anda dapat kehilangan 100% dana Anda. Kinerja masa lalu memberikan NOL indikasi hasil masa depan.

5) TANGGUNG JAWAB PENGGUNA MUTLAK
Anda 100% bertanggung jawab untuk:
- Semua keputusan dan kerugian finansial
- Mengamankan aset digital Anda sendiri
- Memverifikasi semua detail transaksi
- Kepatuhan dengan semua hukum yang berlaku

6) TIDAK ADA JAMINAN SAMA SEKALI
TPC TIDAK memberikan jaminan mengenai:
- Nilai token atau pergerakan harga
- Fungsionalitas atau ketersediaan platform
- Pengembangan atau fitur masa depan
- Bentuk return atau keuntungan apa pun

7) TRANSAKSI FINAL
Semua transaksi TIDAK DAPAT DIBATALKAN dan FINAL. Tidak ada pengembalian, tidak ada pembatalan, tidak ada pengecualian. Anda menanggung tanggung jawab penuh untuk semua kesalahan transaksi.

8) KEPATUHAN HUKUM
Anda harus mematuhi semua hukum di yurisdiksi Anda. TPC tidak memberikan saran hukum atau pajak. Ketidakpatuhan dapat mengakibatkan konsekuensi hukum.

9) TIDAK ADA HUBUNGAN PROFESIONAL
Tidak ada hubungan profesional, kewajiban fidusia, atau hubungan kepercayaan antara Anda dan TPC.

10) INDEMNIFIKASI
Anda setuju untuk mengganti rugi dan membebaskan TPC dari semua klaim, kerugian, atau kerusakan yang timbul dari penggunaan platform Anda.

11) HUKUM YANG MENGATUR
Syarat ini diatur oleh hukum Indonesia. Sengketa akan diselesaikan di pengadilan Indonesia.

12) PENGAKUAN
Dengan menggunakan platform ini, Anda MENGAKUI bahwa Anda memahami dan menerima semua risiko, bahwa Anda dapat kehilangan seluruh investasi, dan bahwa TPC tidak bertanggung jawab atas kerugian apa pun.
`.trim(),
    },
    risk: {
      title: 'Pengungkapan Risiko',
      body: `
PERINGATAN RISIKO EKSTREM - BACA DENGAN CERMAT

Partisipasi aset digital membawa RISIKO KATASTROFIK termasuk:

• Kehilangan 100% seluruh investasi MUNGKIN TERJADI
• Volatilitas harga ekstrem - harga bisa jatuh ke NOL
• Tidak ada perlindungan atau asuransi regulasi
• Kehilangan permanen dari kesalahan teknis
- Peretasan, pencurian, dan pelanggaran keamanan
• Kegagalan dan insolvensi exchange
• Larangan atau pembatasan regulasi
• Komplikasi pajak dan hukum

KEBENARAN MUTLAK:
- Anda DAPAT kehilangan segalanya
• TIDAK ADA yang bisa menjamin keuntungan
- Kinerja masa lalu TIDAK BERARTI apa-apa
- Teknologi BISA dan AKAN gagal
- Pasar DIMANIPULASI

PERINGATAN KRITIS:
- Hanya investasikan apa yang Anda mampu untuk hilang SEPENUHNYA
- Anda 100% bertanggung jawab atas keputusan Anda
- Tidak ada yang akan menolong Anda jika kehilangan uang
- Pasar kripto SANGAT spekulatif

DENGAN MELANJUTKAN, ANDA KONFIRMASI:
- Anda memahami risiko EKSTREM ini
- Anda mampu kehilangan TOTAL
- Anda TIDAK akan menahan TPC bertanggung jawab
- Anda bertindak atas RISIKO ANDA SENDIRI

INI BUKAN SARAN INVESTASI.
`.trim(),
    },
    disclaimer: {
      title: 'Penafian',
      body: `
PENAFIAN MUTLAK - HANYA EDUKASI

TPC HANYA menyediakan konten edukasi dan informasional.

TIDAK ADA bagian dari platform ini yang merupakan:
❌ Saran keuangan
❌ Saran investasi
❌ Saran trading
❌ Jaminan keuntungan
❌ Rekomendasi investasi
❌ Prediksi harga masa depan

KEBENARAN TENTANG TPC:
- Platform edukasi-pertama SAJA
- TIDAK ADA jaminan keuntungan sama sekali
- TIDAK ADA layanan keuangan yang disediakan
- Token utilitas untuk akses platform SAJA

TANGGUNG JAWAB PENGGUNA:
- Anda 100% bertanggung jawab atas SEMUA keputusan
- Anda menanggung 100% dari SEMUA risiko
- Anda harus melakukan riset SENDIRI
- Anda harus mencari saran PROFESIONAL

REALITAS HUKUM:
- TPC BUKAN penasihat keuangan Anda
- TIDAK ADA hubungan profesional yang ada
- TIDAK ADA kewajiban fidusia yang terutang
- Anda TIDAK DAPAT menahan TPC bertanggung jawab atas kerugian

PENGAKUAN RISIKO:
Aset digital dapat menjadi TIDAK BERHARGA. Anda dapat kehilangan SEGALANYA. Ini BUKAN permainan.

PERINGATAN AKHIR:
Jika Anda mencari keuntungan, jaminan, atau saran keuangan, platform ini BUKAN untuk Anda.
`.trim(),
    },
  },
};
