import React, { useEffect, useState } from "react";
import { LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useI18n, type Language, getLangPath } from "../../i18n";
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
  window.location.href = "/";
}

interface HeaderAuthActionsProps {
  lang?: Language;
  variant?: "default" | "mobileMenu";
  onAfterAction?: () => void;
}

export function HeaderAuthActions({ lang, variant = "default", onAfterAction }: HeaderAuthActionsProps) {
  const { language, t } = useI18n(lang || "en");
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
      <div className={`flex ${variant === "mobileMenu" ? "flex-col" : "flex-col md:flex-row"} items-stretch md:items-center gap-2 w-full`}>
        <Link
          to={getLangPath(language, "/signin")}
          className="flex-1"
          onClick={onAfterAction}
        >
          <PremiumButton type="button" variant="secondary" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <LogIn className="w-4 h-4 mr-2" />
            <span className={variant === "mobileMenu" ? "" : "hidden lg:inline"}>{t("auth.signin.signIn")}</span>
            {variant !== "mobileMenu" && <span className="lg:hidden">Sign In</span>}
          </PremiumButton>
        </Link>
        <Link
          to={getLangPath(language, "/signup")}
          className="flex-1"
          onClick={onAfterAction}
        >
          <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className={variant === "mobileMenu" ? "" : "hidden lg:inline"}>{t("auth.signup.createAccount")}</span>
            {variant !== "mobileMenu" && <span className="lg:hidden">Create</span>}
          </PremiumButton>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex ${variant === "mobileMenu" ? "flex-col" : "flex-col md:flex-row"} items-stretch md:items-center gap-2 w-full`}>
      <Link
        to={getLangPath(language, "/member/dashboard")}
        className="flex-1"
        onClick={onAfterAction}
      >
        <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span className={variant === "mobileMenu" ? "" : "hidden lg:inline"}>{t("member.dashboard.title")}</span>
          {variant !== "mobileMenu" && <span className="lg:hidden">Dashboard</span>}
        </PremiumButton>
      </Link>
      <PremiumButton
        type="button"
        variant="secondary"
        className={`h-10 px-4 whitespace-nowrap text-sm ${variant === "mobileMenu" ? "w-full" : "w-full md:w-auto"}`}
        onClick={() => handleAction(doLogout)}
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className={variant === "mobileMenu" ? "" : "hidden lg:inline"}>{t("auth.signout")}</span>
        {variant !== "mobileMenu" && <span className="lg:hidden">Sign Out</span>}
      </PremiumButton>
    </div>
  );
}
