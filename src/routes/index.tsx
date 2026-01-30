import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { PublicRoutes } from "./PublicRoutes";
import { MemberRoutes } from "./MemberRoutes";
import { AdminRoutes } from "./AdminRoutes";
import NotFound from "@/pages/NotFound";

export const AppRoutes = () => (
  <AuthProvider>
    <Routes>
      {/* Public Routes */}
      {PublicRoutes}
      
      {/* Member Routes */}
      {MemberRoutes}
      
      {/* Admin Routes */}
      {AdminRoutes}
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);
