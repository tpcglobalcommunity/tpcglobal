import { FileText, BookOpen, BadgeCheck, Send } from "lucide-react";
import { useI18n, getLangPath } from "@/i18n";
import { PremiumShell, PremiumCard, PremiumButton } from "@/components/ui";
import { Link } from "@/components/Router";

interface LegalPageProps {
  lang: string;
}

// Safe translation helper with fallback
const tt = (t: (key: string) => string, key: string, fallback: string) => {
  const value = t(key);
  return (!value || value === key) ? fallback : value;
};

const LegalPage = ({ lang }: LegalPageProps) => {
  const { t } = useI18n();

  return (
    <PremiumShell>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F0B90B]/10 to-[#C29409]/10 border border-[#F0B90B]/20 mb-6">
              <FileText className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">
                {tt(t, "legal.page.title", "Legal & Transparency")}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {tt(t, "legal.page.title", "Legal & Transparency")}
            </h1>
            
            <p className="text-white/70 leading-relaxed max-w-2xl mx-auto">
              {tt(t, "legal.page.description", "We publish key information to support transparency, accountability, and community trust.")}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Documentation Card */}
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mb-4">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tt(t, "legal.page.docs", "Documentation")}
                </h3>
                
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Comprehensive documentation covering our principles, operations, and community guidelines.
                </p>
                
                <Link to={getLangPath(lang as any, "/docs")}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    View Documentation
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>

            {/* Transparency Card */}
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full mb-4">
                  <BadgeCheck className="w-6 h-6 text-green-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tt(t, "legal.page.transparency", "Transparency")}
                </h3>
                
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Real-time transparency reports, wallet allocations, and complete audit trails for community trust.
                </p>
                
                <Link to={getLangPath(lang as any, "/transparency")}>
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    View Transparency
                  </PremiumButton>
                </Link>
              </div>
            </PremiumCard>

            {/* Telegram Card */}
            <PremiumCard>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mb-4">
                  <Send className="w-6 h-6 text-purple-400" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {tt(t, "legal.page.telegram", "Join Telegram Community")}
                </h3>
                
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  Join our active community on Telegram for updates, discussions, and direct support.
                </p>
                
                <a
                  href="https://t.me/tpcglobalcommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PremiumButton variant="secondary" size="sm" className="w-full">
                    Join Telegram
                  </PremiumButton>
                </a>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </PremiumShell>
  );
};

export default LegalPage;
