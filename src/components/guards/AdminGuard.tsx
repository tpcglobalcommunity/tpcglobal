import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/i18n/i18n";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { withLang } = useI18n();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(withLang("/admin/login"));
      } else if (!isAdmin) {
        // User is logged in but not admin - redirect to home
        navigate(withLang("/"));
      }
    }
  }, [user, loading, isAdmin, navigate, withLang]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};
