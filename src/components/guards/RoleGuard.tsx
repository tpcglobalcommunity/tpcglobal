import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../i18n";

function go(path: string) {
  window.location.assign(path);
}

type RoleGuardProps = {
  allow: Array<string>; // contoh: ["admin","super_admin"]
  children: React.ReactNode;
};

export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const { session, profile, loading } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      go(`/${language}/signin`);
      return;
    }

    if (!profile) {
      go(`/${language}/member/dashboard`);
      return;
    }

    const role = String(profile.role || "").toLowerCase();
    const ok = allow.map(r => r.toLowerCase()).includes(role);

    if (!ok) {
      go(`/${language}/member/dashboard`);
    }
  }, [loading, session, profile, language, allow]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-white/70">
        Loading...
      </div>
    );
  }

  if (!session || !profile) return null;

  const role = String(profile.role || "").toLowerCase();
  const ok = allow.map(r => r.toLowerCase()).includes(role);
  if (!ok) return null;

  return <>{children}</>;
}
