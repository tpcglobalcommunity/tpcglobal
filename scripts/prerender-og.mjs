import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

const pages = ['home', 'docs', 'transparency', 'dao', 'fund', 'legal'];
const languages = ['en', 'id'];

const pageData = {
  en: {
    home: {
      title: 'TPC Global — Home',
      description: 'Education-first trading community. Risk-aware and transparency-driven. No guarantees.',
      ogImage: '/og/en-home.svg'
    },
    docs: {
      title: 'TPC Docs — Documentation',
      description: 'Read documentation: structure, principles, and how to use TPC. No guarantees.',
      ogImage: '/og/en-docs.svg'
    },
    transparency: {
      title: 'Transparency — TPC Global',
      description: 'Wallets, logs, and policies for accountability. No guarantees.',
      ogImage: '/og/en-transparency.svg'
    },
    dao: {
      title: 'DAO Lite — TPC Global',
      description: 'DAO Lite governance model for community participation. No guarantees.',
      ogImage: '/og/en-dao.svg'
    },
    fund: {
      title: 'Community Fund — TPC Global',
      description: 'Community fund overview and allocation principles. No guarantees.',
      ogImage: '/og/en-fund.svg'
    },
    legal: {
      title: 'Legal — TPC Global',
      description: 'Terms, privacy, and disclaimers. Education-first and risk-aware.',
      ogImage: '/og/en-legal.svg'
    }
  },
  id: {
    home: {
      title: 'TPC Global — Beranda',
      description: 'Komunitas trading edukatif, sadar risiko, dan transparan. Tanpa jaminan.',
      ogImage: '/og/id-home.svg'
    },
    docs: {
      title: 'TPC Docs — Dokumentasi',
      description: 'Baca dokumentasi: struktur, prinsip, dan cara memakai TPC. Tanpa jaminan.',
      ogImage: '/og/id-docs.svg'
    },
    transparency: {
      title: 'Transparansi — TPC Global',
      description: 'Wallet, log, dan kebijakan untuk akuntabilitas. Tanpa jaminan.',
      ogImage: '/og/id-transparency.svg'
    },
    dao: {
      title: 'DAO Lite — TPC Global',
      description: 'Model tata kelola DAO Lite untuk partisipasi komunitas. Tanpa jaminan.',
      ogImage: '/og/id-dao.svg'
    },
    fund: {
      title: 'Dana Komunitas — TPC Global',
      description: 'Ringkasan dana komunitas dan prinsip alokasi. Tanpa jaminan.',
      ogImage: '/og/id-fund.svg'
    },
    legal: {
      title: 'Legal — TPC Global',
      description: 'S&K, privasi, dan disclaimer. Edukasi & sadar risiko.',
      ogImage: '/og/id-legal.svg'
    }
  }
};

function updateMetaTags(html, lang, page) {
  const data = pageData[lang][page];
  const canonicalUrl = `https://tpcglobal.io/${lang}/${page}`;

  // Replace title
  html = html.replace(/<title>.*?<\/title>/, `<title>${data.title}</title>`);

  // Replace or add meta description
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${data.description}" />`
  );

  // Replace OG title
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${data.title}" />`
  );

  // Replace OG description
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${data.description}" />`
  );

  // Replace OG image (keep PNG dimensions as fallback, SVG will scale)
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${data.ogImage}" />`
  );

  // Replace or inject OG URL
  if (html.includes('<meta property="og:url"')) {
    html = html.replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `  <meta property="og:url" content="${canonicalUrl}" />\n  </head>`
    );
  }

  // Replace Twitter title
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${data.title}" />`
  );

  // Replace Twitter description
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${data.description}" />`
  );

  // Replace Twitter image
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    `<meta name="twitter:image" content="${data.ogImage}" />`
  );

  // Replace Twitter URL
  html = html.replace(
    /<meta name="twitter:url" content=".*?" \/>/,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );

  // Remove any existing canonical and hreflang links to avoid duplicates
  html = html.replace(/<link rel="canonical"[^>]*\/>/g, '');
  html = html.replace(/<link rel="alternate"[^>]*hreflang[^>]*\/>/g, '');

  // Remove any existing og:locale tags
  html = html.replace(/<meta property="og:locale"[^>]*\/>/g, '');
  html = html.replace(/<meta property="og:locale:alternate"[^>]*\/>/g, '');

  // Build canonical and hreflang tags
  const enUrl = `https://tpcglobal.io/en/${page}`;
  const idUrl = `https://tpcglobal.io/id/${page}`;

  const seoLinks = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<link rel="alternate" href="${enUrl}" hreflang="en" />`,
    `<link rel="alternate" href="${idUrl}" hreflang="id" />`,
    `<link rel="alternate" href="${enUrl}" hreflang="x-default" />`
  ].join('\n    ');

  // Build og:locale tags
  const ogLocale = lang === 'en' ? 'en_US' : 'id_ID';
  const ogLocaleAlternate = lang === 'en' ? 'id_ID' : 'en_US';
  const localeTags = [
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${ogLocaleAlternate}" />`
  ].join('\n    ');

  // Inject canonical/hreflang and locale tags before </head>
  html = html.replace(
    '</head>',
    `  ${seoLinks}\n    ${localeTags}\n  </head>`
  );

  return html;
}

function generateStaticPages() {
  console.log('🎨 Prerendering OG meta tags for static routes...');

  // Read base index.html
  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  let generatedCount = 0;

  // Generate pages for each language and route
  for (const lang of languages) {
    for (const page of pages) {
      const outputDir = path.join(distDir, lang, page);
      const outputPath = path.join(outputDir, 'index.html');

      // Create directory if it doesn't exist
      fs.mkdirSync(outputDir, { recursive: true });

      // Update meta tags
      const updatedHtml = updateMetaTags(baseHtml, lang, page);

      // Write file
      fs.writeFileSync(outputPath, updatedHtml, 'utf-8');

      generatedCount++;
      console.log(`  ✓ /${lang}/${page}/index.html`);
    }
  }

  console.log(`\n✨ Generated ${generatedCount} static pages with per-page OG meta tags`);
}

function generateRootLanguagePages() {
  console.log('\n🌐 Generating root language index pages with redirects...');

  // Read base index.html
  const baseHtml = fs.readFileSync(indexPath, 'utf-8');

  for (const lang of languages) {
    const targetPath = `/${lang}/home`;
    const targetUrl = `https://tpcglobal.io${targetPath}`;
    const data = pageData[lang].home;

    let html = baseHtml;

    // Replace title
    html = html.replace(/<title>.*?<\/title>/, `<title>${data.title}</title>`);

    // Replace meta description
    html = html.replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${data.description}" />`
    );

    // Replace OG tags
    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${data.title}" />`
    );
    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${data.description}" />`
    );
    html = html.replace(
      /<meta property="og:image" content=".*?" \/>/,
      `<meta property="og:image" content="${data.ogImage}" />`
    );

    // Replace or inject OG URL
    if (html.includes('<meta property="og:url"')) {
      html = html.replace(
        /<meta property="og:url" content=".*?" \/>/,
        `<meta property="og:url" content="${targetUrl}" />`
      );
    } else {
      html = html.replace(
        '</head>',
        `  <meta property="og:url" content="${targetUrl}" />\n  </head>`
      );
    }

    // Replace Twitter tags
    html = html.replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${data.title}" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${data.description}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content=".*?" \/>/,
      `<meta name="twitter:image" content="${data.ogImage}" />`
    );
    html = html.replace(
      /<meta name="twitter:url" content=".*?" \/>/,
      `<meta name="twitter:url" content="${targetUrl}" />`
    );

    // Remove any existing canonical, hreflang, and locale tags
    html = html.replace(/<link rel="canonical"[^>]*\/>/g, '');
    html = html.replace(/<link rel="alternate"[^>]*hreflang[^>]*\/>/g, '');
    html = html.replace(/<meta property="og:locale"[^>]*\/>/g, '');
    html = html.replace(/<meta property="og:locale:alternate"[^>]*\/>/g, '');
    html = html.replace(/<meta http-equiv="refresh"[^>]*>/g, '');

    // Build SEO tags pointing to home
    const enHomeUrl = 'https://tpcglobal.io/en/home';
    const idHomeUrl = 'https://tpcglobal.io/id/home';

    const seoLinks = [
      `<meta http-equiv="refresh" content="0;url=${targetPath}">`,
      `<link rel="canonical" href="${targetUrl}" />`,
      `<link rel="alternate" href="${enHomeUrl}" hreflang="en" />`,
      `<link rel="alternate" href="${idHomeUrl}" hreflang="id" />`,
      `<link rel="alternate" href="${enHomeUrl}" hreflang="x-default" />`
    ].join('\n    ');

    const ogLocale = lang === 'en' ? 'en_US' : 'id_ID';
    const ogLocaleAlternate = lang === 'en' ? 'id_ID' : 'en_US';
    const localeTags = [
      `<meta property="og:locale" content="${ogLocale}" />`,
      `<meta property="og:locale:alternate" content="${ogLocaleAlternate}" />`
    ].join('\n    ');

    // Inject all tags before </head>
    html = html.replace(
      '</head>',
      `  ${seoLinks}\n    ${localeTags}\n  </head>`
    );

    // Inject redirect script after <div id="root">
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root"></div>\n    <script>location.replace('${targetPath}');</script>`
    );

    // Write file
    const outputDir = path.join(distDir, lang);
    const outputPath = path.join(outputDir, 'index.html');

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`  ✓ /${lang}/index.html → redirects to ${targetPath}`);
  }

  console.log('✨ Root language pages generated with instant redirects');
}

function updateSitemapBuildDate() {
  console.log('\n📍 Updating sitemap.xml with build date...');

  const sitemapPath = path.join(distDir, 'sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.log('  ⚠️  sitemap.xml not found in dist, skipping');
    return;
  }

  const buildDate = new Date().toISOString().slice(0, 10);
  let sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

  sitemapContent = sitemapContent.replace(/BUILD_DATE/g, buildDate);

  fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
  console.log(`  ✓ sitemap.xml updated with lastmod: ${buildDate}`);
}

try {
  generateStaticPages();
  generateRootLanguagePages();
  updateSitemapBuildDate();
} catch (error) {
  console.error('❌ Error generating static pages:', error);
  process.exit(1);
}
