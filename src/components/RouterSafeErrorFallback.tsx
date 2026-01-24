import { getLanguageFromPath, getLangPath } from "@/i18n";

export default function RouterSafeErrorFallback() {
  const reload = () => window.location.reload();

  const goHome = () => {
    const lang = getLanguageFromPath();
    const homePath = getLangPath(lang, "/home");
    window.location.assign(homePath);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-black">
      <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-center space-y-3">
          <div className="text-3xl font-extrabold text-white">
            Something went wrong
          </div>

          <div className="text-white/70 leading-relaxed">
            We encountered an unexpected error. Please try refreshing the page
            or return to the home page.
          </div>

          <div className="grid gap-3 pt-3">
            <button
              onClick={reload}
              className="h-11 rounded-xl bg-[#f0b90b] text-black font-bold"
            >
              Reload Page
            </button>

            <button
              onClick={goHome}
              className="h-11 rounded-xl border border-white/15 bg-transparent text-white font-bold"
            >
              Go Home
            </button>
          </div>

          <div className="pt-2 text-xs text-white/50">
            If this problem persists, please contact support or join our community.
          </div>
        </div>
      </div>
    </div>
  );
}
