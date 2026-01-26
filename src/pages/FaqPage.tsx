import { useState } from "react";
import { ChevronDown, ChevronUp, Shield, Info, Users } from "lucide-react";
import { PremiumShell, PremiumCard, PremiumButton, NoticeBox } from "@/components/ui";
import { useI18n, type Language } from "@/i18n";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
      >
        <h3 className="text-white font-medium text-left flex-1">{question}</h3>
        <div className="flex-shrink-0 w-5 h-5 text-[#F0B90B] flex items-center justify-center">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-6 pb-4">
          <p className="text-white/70 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

interface FaqPageProps {
  lang?: Language;
}

export default function FaqPage({ lang = "en" }: FaqPageProps) {
  const { t } = useI18n();
  const safeT = (key: string, fallback?: string) => {
    const value = t(key);
    // If the value is the same as the key, it means the key is missing
    if (value === key) {
      console.warn(`[i18n missing] ${lang}:${key}`);
      return fallback || '';
    }
    return value;
  };
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const faqKeys = [
    "what-is-tpc",
    "what-is-tpc-token", 
    "why-tpc-sells-token",
    "does-tpc-promise-profit",
    "tpc-token-usage",
    "token-value-source",
    "is-tpc-safe",
    "is-tpc-mlm",
    "token-circulation",
    "must-buy-token",
    "who-should-join",
    "long-term-vision"
  ] as const;

  return (
    <PremiumShell>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B]/10 via-transparent to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0B90B]/20 border border-[#F0B90B]/30 rounded-full mb-6">
                <Info className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-sm font-medium text-[#F0B90B]">FAQ</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {safeT("faq.title")}
              </h1>
              
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                {safeT("faq.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <PremiumCard className="p-8">
            <div className="space-y-4">
              {faqKeys.map((key) => (
                <FaqItem
                  key={key}
                  question={safeT(`faq.items.${key}.question`, 'Question')}
                  answer={safeT(`faq.items.${key}.answer`, 'Answer')}
                  isOpen={openItems.has(key)}
                  onToggle={() => toggleItem(key)}
                />
              ))}
            </div>
          </PremiumCard>

          {/* Disclaimer Section */}
          <div className="mt-12">
            <NoticeBox 
              variant="warning" 
              title=""
              className="border-[#F0B90B]/30 bg-[#F0B90B]/5"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                <p className="text-white/80 leading-relaxed">
                  {safeT("faq.disclaimer")}
                </p>
              </div>
            </NoticeBox>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PremiumButton 
              variant="secondary" 
              className="w-full justify-center gap-2"
              onClick={() => window.history.back()}
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              {safeT("faq.backToHome")}
            </PremiumButton>
            
            <PremiumButton 
              variant="secondary" 
              className="w-full justify-center gap-2"
              onClick={() => window.location.href = `/${lang}/docs`}
            >
              <Info className="w-4 h-4" />
              {safeT("faq.viewDocs")}
            </PremiumButton>
            
            <PremiumButton 
              variant="secondary" 
              className="w-full justify-center gap-2"
              onClick={() => window.location.href = `/${lang}/community`}
            >
              <Users className="w-4 h-4" />
              {safeT("faq.joinCommunity")}
            </PremiumButton>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
}
