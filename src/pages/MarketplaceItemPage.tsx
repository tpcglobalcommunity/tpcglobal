import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, MessageCircle, ArrowLeft, AlertCircle, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { Language, useI18n, getLangPath } from '../i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '../components/ui';
import { getPublicVendors, PublicVendor } from '../lib/supabase';
import { TrustBadges } from '../components/trust/TrustBadges';
import { createClient } from '@supabase/supabase-js';
import { getLanguageFromPath } from '../lib/authGuards';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface MarketplaceItemPageProps {
  lang: Language;
}

// Mock data for demo purposes
const mockVendor: PublicVendor = {
  id: 'demo',
  brand_name: 'Demo Trading Services',
  description_en: 'Professional trading services with proven track record. We offer education, signals, and managed accounts.',
  description_id: 'Layanan trading profesional dengan track record terbukti. Kami menawarkan edukasi, sinyal, dan akun terkelola.',
  category: 'trading',
  website_url: 'https://example.com',
  contact_telegram: '@demotrading',
  role: 'vendor',
  is_verified: true,
  created_at: new Date().toISOString()
};

const MarketplaceItemPage = ({ lang }: MarketplaceItemPageProps) => {
  const { } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<PublicVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    checkAuthAndLoadItem();
  }, [id]);

  const checkAuthAndLoadItem = async () => {
    try {
      // Check auth for member-only features
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Not logged in - redirect to login with next
        const currentLang = getLanguageFromPath(window.location.pathname);
        const loginPath = `${getLangPath(currentLang, '/login')}?next=${encodeURIComponent(window.location.pathname)}`;
        window.location.assign(loginPath);
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser?.email_confirmed_at) {
        // Not verified - redirect to verify
        const currentLang = getLanguageFromPath(window.location.pathname);
        const verifyPath = getLangPath(currentLang, '/verify');
        window.location.assign(verifyPath);
        return;
      }

      // Load item data
      await loadItem();
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Authentication failed');
      setLoading(false);
    }
  };

  const loadItem = async () => {
    try {
      setLoading(true);
      setError(null);

      if (id === 'demo') {
        // Use mock data for demo
        setTimeout(() => {
          setVendor(mockVendor);
          setLoading(false);
        }, 500);
        return;
      }

      // Try to load real vendor data
      const vendors = await getPublicVendors();
      const foundVendor = vendors.find(v => v.id === id);
      
      if (foundVendor) {
        setVendor(foundVendor);
      } else {
        setError('Vendor not found');
      }
    } catch (err) {
      console.error('Error loading vendor:', err);
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (method: 'website' | 'telegram') => {
    if (!vendor) return;

    setContacting(true);
    try {
      // Simulate contact tracking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (method === 'website' && vendor.website_url) {
        window.open(vendor.website_url, '_blank', 'noopener,noreferrer');
      } else if (method === 'telegram' && vendor.contact_telegram) {
        window.open(`https://t.me/${vendor.contact_telegram.replace('@', '')}`, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Contact error:', err);
    } finally {
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#F0B90B] animate-spin mx-auto mb-4" />
              <p className="text-white/60">Loading vendor details...</p>
            </div>
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (error || !vendor) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <PremiumCard>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                {error || 'Vendor Not Found'}
              </h1>
              <p className="text-white/60 mb-6">
                The vendor you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex gap-4 justify-center">
                <PremiumButton onClick={() => navigate(getLangPath(lang, '/marketplace'))}>
                  <ArrowLeft className="w-4 h-4" />
                  Back to Marketplace
                </PremiumButton>
                <PremiumButton onClick={loadItem} variant="secondary">
                  Try Again
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(getLangPath(lang, '/marketplace'))}
          className="flex items-center gap-2 text-white/60 hover:text-[#F0B90B] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        {/* Vendor Header */}
        <PremiumCard className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {vendor.brand_name}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-sm bg-[#F0B90B]/20 text-[#F0B90B] rounded-full border border-[#F0B90B]/30">
                      {vendor.category.charAt(0).toUpperCase() + vendor.category.slice(1)}
                    </span>
                    {vendor.is_verified && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <TrustBadges
                role={vendor.role as any}
                is_verified={vendor.is_verified}
                can_invite={false}
                vendor_status="approved"
                vendor_brand_name={vendor.brand_name}
                mode="public"
                lang={lang}
              />
            </div>
          </div>
        </PremiumCard>

        {/* Description */}
        <PremiumCard className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">About</h2>
          <p className="text-white/70 leading-relaxed">
            {lang === 'id' ? vendor.description_id : vendor.description_en}
          </p>
        </PremiumCard>

        {/* Contact Actions */}
        <PremiumCard className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Get in Touch</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {vendor.website_url && (
              <PremiumButton
                onClick={() => handleContact('website')}
                disabled={contacting}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </PremiumButton>
            )}
            {vendor.contact_telegram && (
              <PremiumButton
                onClick={() => handleContact('telegram')}
                disabled={contacting}
                variant="secondary"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4" />
                Contact on Telegram
              </PremiumButton>
            )}
          </div>
        </PremiumCard>

        {/* Disclaimer */}
        <NoticeBox variant="warning" className="mb-8">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-[#F0B90B] mt-0.5" />
            <div>
              <h3 className="font-medium text-white mb-1">Important Notice</h3>
              <p className="text-sm text-white/70">
                Always verify vendors independently. TPC does not endorse or guarantee any services listed in the marketplace. 
                Conduct your own due diligence before engaging with any vendor.
              </p>
            </div>
          </div>
        </NoticeBox>

        {/* Report Issue */}
        <div className="text-center">
          <button
            onClick={() => navigate(getLangPath(lang, '/support'))}
            className="text-white/60 hover:text-[#F0B90B] transition-colors text-sm"
          >
            Report an issue with this vendor
          </button>
        </div>
      </div>
    </PremiumShell>
  );
};

export default MarketplaceItemPage;
