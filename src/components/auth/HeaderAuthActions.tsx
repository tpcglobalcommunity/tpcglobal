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

export function HeaderAuthActions({ lang }: { lang?: Language }) {
  const { language, t } = useI18n(lang || "en");
  const { loading, isAuthed } = useSession();

  if (loading) {
    return <div className="w-[220px] h-10" />;
  }

  if (!isAuthed) {
    return (
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full">
        <Link to={getLangPath(language, "/signin")} className="flex-1">
          <PremiumButton type="button" variant="secondary" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <LogIn className="w-4 h-4 mr-2" />
            <span className="whitespace-nowrap">{t("auth.signin.signIn")}</span>
          </PremiumButton>
        </Link>
        <Link to={getLangPath(language, "/signup")} className="flex-1">
          <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="whitespace-nowrap">{t("auth.signup.createAccount")}</span>
          </PremiumButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full">
      <Link to={getLangPath(language, "/member/dashboard")} className="flex-1">
        <PremiumButton type="button" className="h-10 px-4 whitespace-nowrap text-sm w-full">
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span className="whitespace-nowrap">{t("member.dashboard.title")}</span>
        </PremiumButton>
      </Link>
      <PremiumButton
        type="button"
        variant="secondary"
        className="h-10 px-4 whitespace-nowrap text-sm w-full md:w-auto"
        onClick={doLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className="whitespace-nowrap">{t("auth.signout")}</span>
      </PremiumButton>
    </div>
  );
}
