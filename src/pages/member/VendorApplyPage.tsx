import { useState } from 'react';
import { Store, Send, CheckCircle } from 'lucide-react';
import { Language, useTranslations } from '@/i18n';
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from '@/components/ui';
import MemberGuard from '@/components/guards/MemberGuard';
import { submitVendorApplication } from '@/lib/supabase';

interface VendorApplyPageProps {
  lang: Language;
}

const CATEGORIES = [
  'trading',
  'education',
  'services',
  'technology',
  'consulting',
  'media',
  'other',
];

const VendorApplyPage = ({ lang }: VendorApplyPageProps) => {
  const t = useTranslations(lang);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand_name: '',
    category: 'services',
    description_en: '',
    description_id: '',
    website_url: '',
    contact_telegram: '',
    contact_email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.brand_name.length < 3) {
      setError('Brand name must be at least 3 characters');
      return;
    }

    if (formData.description_en.length < 20) {
      setError('English description must be at least 20 characters');
      return;
    }

    if (formData.description_id.length < 20) {
      setError('Indonesian description must be at least 20 characters');
      return;
    }

    try {
      setSubmitting(true);

      await submitVendorApplication({
        brand_name: formData.brand_name,
        category: formData.category,
        description_en: formData.description_en,
        description_id: formData.description_id,
        website_url: formData.website_url || undefined,
        contact_telegram: formData.contact_telegram || undefined,
        contact_email: formData.contact_email || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting vendor application:', err);
      setError(err.message || t.member.profile.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <MemberGuard lang={lang}>
        <PremiumShell>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
            <PremiumCard>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {t.vendor.apply.submittedTitle}
                </h1>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                  {t.vendor.apply.submittedDesc}
                </p>
                <PremiumButton onClick={() => window.location.href = `/${lang}/member/dashboard`}>
                  {t.member.dashboard.title}
                </PremiumButton>
              </div>
            </PremiumCard>
          </div>
        </PremiumShell>
      </MemberGuard>
    );
  }

  return (
    <MemberGuard lang={lang}>
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 pb-24 md:pb-28">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Store className="w-8 h-8 text-[#F0B90B]" />
              {t.vendor.apply.title}
            </h1>
            <p className="text-white/70 text-lg">
              {t.vendor.apply.subtitle}
            </p>
          </div>

          <NoticeBox variant="info" className="mb-6">
            {t.vendor.apply.disclaimer}
          </NoticeBox>

          <PremiumCard>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.vendor.apply.brandName} *
                </label>
                <input
                  type="text"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  placeholder="Your Brand or Business Name"
                  required
                  minLength={3}
                />
                <p className="text-xs text-white/50 mt-1">Minimum 3 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.vendor.apply.category} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.vendor.apply.descriptionEn} *
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all resize-none"
                  placeholder="Describe your business in English..."
                  required
                  minLength={20}
                />
                <p className="text-xs text-white/50 mt-1">
                  Minimum 20 characters ({formData.description_en.length}/20)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {t.vendor.apply.descriptionId} *
                </label>
                <textarea
                  value={formData.description_id}
                  onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all resize-none"
                  placeholder="Jelaskan bisnis Anda dalam bahasa Indonesia..."
                  required
                  minLength={20}
                />
                <p className="text-xs text-white/50 mt-1">
                  Minimum 20 karakter ({formData.description_id.length}/20)
                </p>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t.vendor.apply.contactInfo}
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  {t.vendor.apply.contactInfoDesc}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t.vendor.apply.website}
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t.vendor.apply.telegram}
                    </label>
                    <input
                      type="text"
                      value={formData.contact_telegram}
                      onChange={(e) => setFormData({ ...formData, contact_telegram: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                      placeholder="@yourtelegram"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      {t.vendor.apply.email}
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 focus:border-transparent transition-all"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <PremiumButton type="submit" disabled={submitting}>
                  <Send className="w-5 h-5" />
                  {submitting ? t.vendor.apply.submitting : t.vendor.apply.submit}
                </PremiumButton>
              </div>
            </form>
          </PremiumCard>
        </div>
      </PremiumShell>
    </MemberGuard>
  );
};

export default VendorApplyPage;
