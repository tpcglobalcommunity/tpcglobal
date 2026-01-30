import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireAuth = ({ children, redirectTo = "/login" }: RequireAuthProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
