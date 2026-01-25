import { useState, useEffect } from 'react';
import { Link } from '@/components/Router';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumShell, PremiumCard, PremiumButton } from '@/components/ui';
import { submitVendorApplication, getMyVendorApplication, type VendorApplication, type VendorApplicationInput } from '@/lib/vendorApplications';
import { ArrowLeft, Building2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Props = {
  lang: string;
};

export default function ApplyVendor({ lang }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<VendorApplicationInput>({
    brand_name: '',
    category: '',
    description: '',
    website: '',
    contact_email: ''
  });

  const categories = [
    'education',
    'consulting', 
    'services',
    'technology',
    'marketplace'
  ];

  useEffect(() => {
    fetchApplication();
  }, [user]);

  const fetchApplication = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getMyVendorApplication();
      if (error) {
        setError(error);
      } else {
        setApplication(data);
      }
    } catch (err) {
      setError('Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!formData.brand_name || !formData.category || !formData.description || !formData.contact_email) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitVendorApplication(formData);
      if (result.success) {
        await fetchApplication(); // Refresh to get the new application
        setFormData({
          brand_name: '',
          category: '',
          description: '',
          website: '',
          contact_email: ''
        });
      } else {
        setError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getStatusDisplay = () => {
    if (!application) return null;

    switch (application.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Your application is under review</p>
              <p className="text-white/70 text-sm">We'll review your application and get back to you soon</p>
            </div>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">You are a verified vendor</p>
              <p className="text-white/70 text-sm">Your vendor application has been approved</p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Application rejected</p>
              <p className="text-white/70 text-sm">Your application was not approved at this time</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#F0B90B]" />
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (!user) {
    return (
      <PremiumShell>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Sign in Required</h1>
            <p className="text-white/70 mb-6">Please sign in to apply as a vendor</p>
            <Link to={`/${lang}/signin`}>
              <PremiumButton>
                Sign In
              </PremiumButton>
            </Link>
          </div>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/${lang}/member`} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Member Area
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Apply as Vendor</h1>
          <p className="text-white/70">Become a verified vendor on TPC Global Marketplace</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Status Display */}
        {application && getStatusDisplay()}

        {/* Application Form */}
        {!application && (
          <PremiumCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50"
                  placeholder="Enter your brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#F0B90B]/50"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50"
                  placeholder="Describe your products/services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50"
                  placeholder="https://your-website.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#F0B90B]/50"
                  placeholder="contact@your-brand.com"
                />
              </div>

              <PremiumButton
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </PremiumButton>
            </form>
          </PremiumCard>
        )}
      </div>
    </PremiumShell>
  );
}
