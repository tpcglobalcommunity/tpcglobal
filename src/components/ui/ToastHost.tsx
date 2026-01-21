import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { PremiumCard, PremiumButton } from './index';
import { useToastListener, showToast, type ToastOptions } from '../../hooks/useRealtimeNotifications';
import { type Language, getLangPath } from '../../i18n';

interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

export default function ToastHost({ lang }: { lang: Language }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const baseMember = `${getLangPath(lang, "")}/member`;

  // Listen for new toasts
  useToastListener((options) => {
    const id = Date.now().toString();
    const toast: ToastItem = {
      ...options,
      id,
      createdAt: Date.now()
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after duration
    const duration = options.duration || 6000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  });

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <PremiumCard
          key={toast.id}
          className="pointer-events-auto p-4 min-w-[320px] max-w-[400px] bg-black/90 border-white/20 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] transform transition-all duration-300 ease-out"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm leading-tight">
                {toast.title}
              </h4>
              {toast.body && (
                <p className="text-white/70 text-xs mt-1 leading-tight">
                  {toast.body}
                </p>
              )}
              {toast.action && (
                <div className="mt-2">
                  <PremiumButton
                    size="sm"
                    onClick={() => {
                      toast.action.onClick();
                      removeToast(toast.id);
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {toast.action.label}
                    </span>
                  </PremiumButton>
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white/80 transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}

// Export toast helper for easy use
export { showToast };
