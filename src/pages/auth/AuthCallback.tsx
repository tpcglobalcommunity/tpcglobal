import { useEffect, useState } from "react";
import { useNavigate } from "@/components/Router";
import { supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/ensureProfile";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          setStatus("error");
          setMessage(errorDescription || error);
          return;
        }

        // Get current session first
        const { data: sessionData } = await supabase.auth.getSession();
        
        let session = sessionData.session;

        // If no session, try to exchange code for session
        if (!session && code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (exchangeError) {
            setStatus("error");
            setMessage(exchangeError.message || "Failed to verify email");
            return;
          }
          
          session = exchangeData.session;
        }

        if (!session?.user) {
          setStatus("error");
          setMessage("No valid session found");
          return;
        }

        // Ensure profile exists
        try {
          await ensureProfile(session.user);
        } catch (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't fail the whole flow for profile errors, just log them
        }

        setStatus("success");
        setMessage("Email verified successfully! Setting up your profile...");

        // Redirect to onboarding after successful verification
        setTimeout(() => {
          // Extract language from URL or default to 'en'
          const pathLang = window.location.pathname.match(/^\/(en|id)\//)?.[1] || 'en';
          navigate(`/${pathLang}/onboarding`);
        }, 2000);

      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "An unexpected error occurred");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg shadow-black/30 p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-[#F0B90B] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Verifying Email...</h2>
              <p className="text-white/60">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Email Verified!</h2>
              <p className="text-white/60">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
              <p className="text-white/60 mb-4">{message}</p>
              <button
                onClick={() => navigate("/signin")}
                className="px-6 py-2 bg-[#F0B90B] text-black font-medium rounded-lg hover:bg-[#F0B90B]/90 transition-colors"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
