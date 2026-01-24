import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { User, Home } from "lucide-react";
import { ensureLangPath } from "@/utils/langPath";

export default function AlreadySignedIn() {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-[#F0B90B]/5 via-transparent to-transparent" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              {t("alreadySignedIn.title") || "You're Already Signed In"}
            </h1>
            <p className="text-white/60 text-lg">
              {t("alreadySignedIn.subtitle") || "You're currently logged in to your TPC account"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {t("alreadySignedIn.welcomeBack") || "Welcome Back!"}
              </h2>
              <p className="text-white/60">
                {t("alreadySignedIn.message") || "Continue to your dashboard or explore the community"}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(ensureLangPath(lang, "/member"))}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F0B90B] to-[#F8D568] text-black font-semibold hover:from-[#F0B90B]/90 hover:to-[#F8D568]/90 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t("alreadySignedIn.goToDashboard") || "Go to Dashboard"}
              </button>
              
              <button
                onClick={() => navigate(ensureLangPath(lang, "/"))}
                className="w-full h-12 rounded-xl border border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t("alreadySignedIn.goHome") || "Go to Home"}
              </button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <Link 
                to={ensureLangPath(lang, "/signin")}
                className="text-white/60 hover:text-white/80 text-sm transition-colors"
              >
                {t("alreadySignedIn.signOut") || "Sign Out"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
