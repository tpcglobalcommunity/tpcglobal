import { useState, useEffect } from 'react';
import { AlertCircle, User, ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ensureLangPath } from '../../utils/langPath';

interface ProfileCompletionBannerProps {
  lang: string;
  currentPath: string;
}

export default function ProfileCompletionBanner({ lang, currentPath }: ProfileCompletionBannerProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        setProfile(profileData);
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  // Don't show if loading, dismissed, or profile is complete
  if (loading || dismissed || !profile) return null;
  
  // Check if profile needs completion (full_name is null or empty)
  if (profile.full_name && profile.full_name.trim()) return null;

  // Don't show on profile page itself
  if (currentPath.includes('/profile') || currentPath.includes('/settings')) return null;

  return (
    <div className="bg-gradient-to-r from-[#F0B90B]/10 to-[#F8D568]/10 border border-[#F0B90B]/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0B90B]/20 flex items-center justify-center">
            <User className="w-5 h-5 text-[#F0B90B]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              {t("profile.completion.title", "Complete Your Profile")}
            </h3>
            <p className="text-white/70 text-xs">
              {t("profile.completion.subtitle", "Add your full name for a better experience")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ensureLangPath(lang as any, '/profile'))}
            className="px-3 py-1.5 bg-[#F0B90B] text-black text-sm font-medium rounded-lg hover:bg-[#F0B90B]/90 transition-colors flex items-center gap-1"
          >
            {t("profile.completion.complete", "Complete")}
            <ChevronRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setDismissed(true)}
            className="text-white/50 hover:text-white/70 transition-colors p-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
