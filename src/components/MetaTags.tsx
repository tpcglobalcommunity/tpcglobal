import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n/i18n';

interface MetaTagsProps {
  title?: string;
  description?: string;
}

const MetaTags = ({ title, description }: MetaTagsProps) => {
  const { t, lang } = useI18n();
  const location = useLocation();

  useEffect(() => {
    // Get runtime origin for environment safety
    const origin = window.location.origin;
    
    // Get current URL for canonical and og:url (NO query params, NO hash)
    const currentUrl = `${origin}${location.pathname}`;
    
    // Safe fallback with i18n keys only
    const defaultTitle = title || t("meta.default.title");
    const defaultDescription = description || t("meta.default.description");
    const defaultOgImage = t("meta.default.ogImage") || "/og/tpc-og.png";
    
    // Create absolute OG image URL
    const ogImageAbs = origin + defaultOgImage;

    // Update document title with safe fallback
    document.title = defaultTitle || 'TPC Global';

    // Helper function to update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Helper function to update link tags
    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // 1️⃣ BASIC META TAGS
    updateMetaTag('description', defaultDescription);

    // 2️⃣ CANONICAL URL (CRITICAL)
    updateLinkTag('canonical', currentUrl);

    // 3️⃣ OPEN GRAPH META TAGS
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:site_name', 'TPC Global');
    updateMetaTag('og:title', defaultTitle);
    updateMetaTag('og:description', defaultDescription);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:image', ogImageAbs);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');

    // 4️⃣ TWITTER CARD META TAGS
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', defaultTitle);
    updateMetaTag('twitter:description', defaultDescription);
    updateMetaTag('twitter:image', ogImageAbs);

    // 5️⃣ LANGUAGE-SPECIFIC META
    updateMetaTag('og:locale', lang === 'id' ? 'id_ID' : 'en_US');

    // 6️⃣ ALTERNATE LANGUAGE LINKS (SEO)
    const currentPath = location.pathname.replace(/^\/(en|id)/, '');
    
    // Update alternate language links
    const updateAlternateLink = (hreflang: string, href: string) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Add alternate language links
    updateAlternateLink('en', `${origin}/en${currentPath}`);
    updateAlternateLink('id', `${origin}/id${currentPath}`);
    updateAlternateLink('x-default', `${origin}/id${currentPath}`);

  }, [title, description, lang, location.pathname, t]);

  return null;
};

export default MetaTags;
