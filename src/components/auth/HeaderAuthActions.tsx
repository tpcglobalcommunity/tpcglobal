import React, { useEffect, useState } from "react";
import { LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useI18n, type Language, getLangPath } from "@/i18n";
import { Link } from "../Router";
import { PremiumButton } from "../ui";

function useSession() {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setIsAuthed(!!data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setIsAuthed(!!session);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, isAuthed };
}

async function doLogout() {
  await supabase.auth.signOut();
  // Get current language and redirect to language-specific home
  const currentLang = window.location.pathname.match(/^\/(en|id)/)?.[1] || 'en';
  window.location.href = `/${currentLang}/home`;
}

interface HeaderAuthActionsProps {
  lang?: Language;
  variant?: "default" | "mobileMenu";
  onAfterAction?: () => void;
}

export function HeaderAuthActions({ lang, variant = "default", onAfterAction }: HeaderAuthActionsProps) {
  const { language, t } = useI18n();
  const { loading, isAuthed } = useSession();

  const handleAction = (action: () => void) => {
    action();
    onAfterAction?.();
  };

  if (loading) {
    return <div className="w-[220px] h-10" />;
  }

  if (!isAuthed) {
    return (
      <div className={`flex ${variant === "mobileMenu" ? "flex-col" : "flex-row"} items-stretch gap-2 w-full`}>
        <Link
          to={getLangPath(language, "/signin")}
          className="flex-1"
          onClick={onAfterAction}
        >
          <PremiumButton type="button" variant="secondary" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </PremiumButton>
        </Link>
        <Link
          to={getLangPath(language, "/signup")}
          className="flex-1"
          onClick={onAfterAction}
        >
          <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </PremiumButton>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex ${variant === "mobileMenu" ? "flex-col" : "flex-row"} items-stretch gap-2 w-full`}>
      <Link
        to={getLangPath(language, "/member/dashboard")}
        className="flex-1"
        onClick={onAfterAction}
      >
        <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </PremiumButton>
      </Link>
      <PremiumButton
        type="button"
        variant="secondary"
        className={`h-10 px-4 whitespace-nowrap text-sm ${variant === "mobileMenu" ? "w-full" : "w-auto"}`}
        onClick={() => handleAction(doLogout)}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </PremiumButton>
    </div>
  );
}
