import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";
import type { Language } from "@/i18n";

function go(path: string) {
  window.location.assign(path);
}

type RoleGuardProps = {
  allowedRoles?: string[]; // untuk kompatibilitas dengan kode admin
  allow?: Array<string>; // backward compatibility
  lang?: Language; // opsional, tidak digunakan dalam logic
  children: React.ReactNode;
};

export default function RoleGuard({ allowedRoles, allow, children }: RoleGuardProps) {
  const { session, profile, loading } = useAuth();
  const { language } = useI18n();

  // Gunakan allowedRoles jika ada, fallback ke allow
  const roles = allowedRoles || allow || [];

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
    const ok = roles.map(r => r.toLowerCase()).includes(role);

    if (!ok) {
      go(`/${language}/member/dashboard`);
    }
  }, [loading, session, profile, language, roles]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-white/70">
        Loading...
      </div>
    );
  }

  if (!session || !profile) return null;

  const role = String(profile.role || "").toLowerCase();
  const ok = roles.map(r => r.toLowerCase()).includes(role);
  if (!ok) return null;

  return <>{children}</>;
}
