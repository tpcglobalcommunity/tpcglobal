import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { isAdmin } from "@/lib/admin";

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

  // Use database admin check instead of hardcoded list
  const [isAdminUser, setIsAdminUser] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  if (isAdminUser === null) {
    return <div>Checking permissions...</div>;
  }
  
  if (!isAdminUser) {
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
