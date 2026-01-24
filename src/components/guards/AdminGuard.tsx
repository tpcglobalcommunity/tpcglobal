import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLangPath, type Language } from "@/i18n";
import { NoticeBox } from "../ui";

export default function AdminGuard({
  lang,
  children,
}: {
  lang: Language;
  children: ReactNode;
}) {
  const { session, profile, loading } = useAuth();

  // Redirect harus di hook yang selalu terpanggil (tidak boleh di bawah return conditional)
  useEffect(() => {
    if (!loading && !session) {
      const next = encodeURIComponent(getLangPath(lang, "/admin/control"));
      window.location.assign(`${getLangPath(lang, "/signin")}?next=${next}`);
    }
  }, [loading, session, lang]);

  // 1) auth masih loading
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <NoticeBox variant="info" title="Loading admin session…">
          Checking authentication & role…
        </NoticeBox>
      </div>
    );
  }

  // 2) belum login (akan redirect oleh useEffect)
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <NoticeBox variant="warning" title="Redirecting…">
          Please sign in to access admin.
        </NoticeBox>
      </div>
    );
  }

  // 3) session ada tapi profile belum ke-load (atau belum dibuat)
  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <NoticeBox variant="info" title="Loading profile…">
          Fetching your admin profile…
        </NoticeBox>
      </div>
    );
  }

  // 4) cek role + verified (kolom di DB = verified)
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";
  const isVerified = profile.verified === true;
  const isOk = isAdmin && isVerified;

  if (!isOk) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <NoticeBox variant="danger" title="Access denied">
          {!isAdmin
            ? "Your account does not have admin permissions."
            : "Your admin account is not verified yet."}
        </NoticeBox>
      </div>
    );
  }

  return <>{children}</>;
}
