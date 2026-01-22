import { useEffect, useState } from "react";
import { getAppSettings, type AppSettings } from "../../lib/settings";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabase";

type GlobalBannerProps = {
  lang: string;
};

export default function GlobalBanner({ lang }: GlobalBannerProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getAppSettings(supabase);
        if (!alive) return;
        setSettings(s);
      } catch {
        // Silently fail - banner just won't show
      }
    })();
    return () => { alive = false; };
  }, []);

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissedKey = `banner_dismissed_${settings?.global_banner_text || 'default'}`;
    const isDismissed = localStorage.getItem(dismissedKey) === 'true';
    setDismissed(isDismissed);
  }, [settings?.global_banner_text]);

  const handleDismiss = () => {
    const dismissedKey = `banner_dismissed_${settings?.global_banner_text || 'default'}`;
    localStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  };

  if (!settings?.global_banner_enabled || dismissed || !settings?.global_banner_text) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-[#F0B90B]/20 to-[#F0B90B]/10 border-b border-[#F0B90B]/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/90 text-center md:text-left">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-[#F0B90B] rounded-full animate-pulse"></span>
                {settings.global_banner_text}
              </span>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
