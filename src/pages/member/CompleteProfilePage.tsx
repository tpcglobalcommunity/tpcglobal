import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from '../../components/Router';
import { useProfileStatus } from '../../lib/useProfileStatus';
import { supabase } from '../../lib/supabase';
import { PremiumShell, PremiumCard, PremiumButton } from '../../components/ui';
import { User, Phone, Send, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface CompleteProfilePageProps {
  lang: any;
}

export default function CompleteProfilePage({ lang }: CompleteProfilePageProps) {
  const navigate = useNavigate();
  const { role, verified, loading } = useProfileStatus();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    telegram: '',
    city: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Skip form if already verified
  useEffect(() => {
    if (verified) {
      navigate('/member/dashboard');
    }
  }, [verified, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const { full_name, phone, telegram, city } = formData;
    
    if (!full_name.trim()) {
      setError('Full Name is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone Number is required');
      return false;
    }
    if (!telegram.trim()) {
      setError('Telegram Username is required');
      return false;
    }
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('No authenticated session found. Please sign in again.');
        setTimeout(() => {
          navigate(`/${lang}/signin`);
        }, 2000);
        return;
      }

      // Prepare update data with correct field names
      const updateData = {
        id: session.user.id,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        telegram: formData.telegram.trim(),
        city: formData.city.trim(),
        updated_at: new Date().toISOString()
      };

      console.log('[CompleteProfile] Saving profile data:', updateData);

      // Update profile with upsert
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (updateError) {
        console.error('[CompleteProfile] Supabase error:', updateError);
        throw updateError;
      }

      console.log('[CompleteProfile] Profile saved successfully');
      
      setSuccess(true);
      
      // Wait a moment then redirect
      setTimeout(() => {
        navigate(`/${lang}/member/dashboard`);
      }, 2000);
      
    } catch (err: any) {
      console.error('[CompleteProfile] Error updating profile:', err);
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Loading profile...</p>
          </div>
        </div>
      </PremiumShell>
    );
  }

  if (success) {
    return (
      <PremiumShell>
        <div className="min-h-screen flex items-center justify-center">
          <PremiumCard>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Profile Completed!</h2>
              <p className="text-white/70 mb-6">
                Your profile has been successfully updated. Redirecting to dashboard...
              </p>
            </div>
          </PremiumCard>
        </div>
      </PremiumShell>
    );
  }

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center py-12">
        <PremiumCard>
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#F0B90B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#F0B90B]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-white/60 text-sm">
                We need some additional information to complete your profile
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="+62 812-3456-7890"
                    required
                  />
                </div>
              </div>

              {/* Telegram Username */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Telegram Username
                </label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="@username"
                    required
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#F0B90B]/50 focus:bg-white/10 transition-all"
                    placeholder="Jakarta"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <PremiumButton
                type="submit"
                disabled={saving}
                className="w-full py-3 text-base font-semibold"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </PremiumButton>
            </form>

            {/* Notice */}
            <div className="mt-6 p-4 bg-[#F0B90B]/10 border border-[#F0B90B]/20 rounded-lg">
              <p className="text-white/60 text-xs text-center">
                Complete your profile to access all member features
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>
    </PremiumShell>
  );
}
