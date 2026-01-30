import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// Admin UUID whitelist - in production this should come from environment variables
const ADMIN_USER_IDS = [
  // Add admin UUIDs here
  // "admin-uuid-1",
  // "admin-uuid-2",
];

interface RequireAdminProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireAdmin = ({ children, redirectTo = "/member" }: RequireAdminProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = ADMIN_USER_IDS.includes(user.id);
  
  if (!isAdmin) {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
