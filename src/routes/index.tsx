import { Routes, Route, Navigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireAdmin } from "@/components/guards/RequireAdmin";
import { PublicLayout } from "@/layouts/PublicLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import BuyTpcPage from "@/pages/public/BuyTpcPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import PresaleStatsPage from "@/pages/public/PresaleStatsPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";
import EducationPage from "@/pages/public/EducationPage";
import AntiScamFaqPage from "@/pages/public/AntiScamFaqPage";
import InvoiceDetailPage from "@/pages/public/InvoiceDetailPage";
import DaoLitePage from "@/pages/public/DaoLitePage";
import DaoSnapshotPage from "@/pages/public/DaoSnapshotPage";

// Auth Pages
import LoginPage from "@/pages/public/LoginPage";
import AuthCallback from "@/pages/auth/AuthCallback";

// Member Pages
import MemberShell from "@/pages/member/MemberShell";
import MemberHome from "@/pages/member/MemberHome";
import MemberInvoicesPage from "@/pages/member/MemberInvoicesPage";
import MemberInvoiceDetailPage from "@/pages/member/MemberInvoiceDetailPage";
import MemberSettingsPage from "@/pages/member/MemberSettingsPage";

// Admin Pages
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// System
import NotFound from "@/pages/NotFound";

// HomeRedirect component for dynamic /:lang/home routes
const HomeRedirect = () => {
  const { lang } = useParams<{ lang: string }>();
  
  // Only redirect for valid languages, fallback to /id
  const validLangs = ['en', 'id'];
  const targetLang = validLangs.includes(lang || '') ? lang : 'id';
  
  return <Navigate to={`/${targetLang}`} replace />;
};

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root redirect to default language */}
        <Route path="/" element={<Navigate to="/id" replace />} />
        
        {/* Root transparency redirect */}
        <Route path="/transparency" element={<Navigate to="/id/transparency" replace />} />
        
        {/* Root DAO routes (redirect to default language) */}
        <Route path="/dao" element={<Navigate to="/id/dao" replace />} />
        <Route path="/dao/snapshot" element={<Navigate to="/id/dao/snapshot" replace />} />
        
        {/* Root member redirect */}
        <Route path="/member" element={<Navigate to="/id/member" replace />} />
        
        {/* Language-prefixed routes */}
        <Route path="/:lang" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="verified" element={<VerifiedPage />} />
          <Route path="buytpc" element={<BuyTpcPage />} />
          <Route path="transparency" element={<TransparencyPage />} />
          <Route path="presale-stats" element={<PresaleStatsPage />} />
          <Route path="anti-scam-faq" element={<AntiScamFaqPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="dao" element={<DaoLitePage />} />
          <Route path="dao/snapshot" element={<DaoSnapshotPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/callback" element={<AuthCallback />} />
          
          {/* Member Routes */}
          <Route path="member" element={<MemberShell />}>
            <Route index element={<MemberHome />} />
            <Route path="invoices" element={<MemberInvoicesPage />} />
            <Route path="invoices/:invoiceNo" element={<MemberInvoiceDetailPage />} />
            <Route path="settings" element={<MemberSettingsPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }>
          <Route index element={<div>Admin Dashboard (Coming Soon)</div>} />
          <Route path="invoices" element={<div>Admin Invoices (Coming Soon)</div>} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Legacy /home redirects - MUST be before catch-all */}
        <Route path="/en/home" element={<Navigate to="/en" replace />} />
        <Route path="/id/home" element={<Navigate to="/id" replace />} />
        <Route path="/:lang/home" element={<HomeRedirect />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
