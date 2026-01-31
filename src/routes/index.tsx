import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireAdmin } from "@/components/guards/RequireAdmin";
import { PublicLayout } from "@/layouts/PublicLayout";
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
import LoginPage from "@/pages/auth/LoginPage";
import AuthCallbackPage from "@/pages/auth/AuthCallbackPage";

// Member Pages
import MemberShell from "@/pages/member/MemberShell";
import MemberHome from "@/pages/member/MemberHome";
import MemberInvoicesPage from "@/pages/member/MemberInvoicesPage";
import MemberInvoiceDetailPage from "@/pages/member/MemberInvoiceDetailPage";
import MemberSettingsPage from "@/pages/member/MemberSettingsPage";
import MemberTestPage from "@/pages/member/MemberTestPage";

// Admin Pages
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// System
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Root redirects */}
        <Route path="/" element={<Navigate to="/id" replace />} />
        <Route path="/login" element={<Navigate to="/id/login" replace />} />
        <Route path="/auth/callback" element={<Navigate to="/id/auth/callback" replace />} />
        <Route path="/callback" element={<Navigate to="/id/auth/callback" replace />} />
        <Route path="/dashboard" element={<Navigate to="/id/dashboard" replace />} />
        <Route path="/member" element={<Navigate to="/id/member" replace />} />
        <Route path="/admin" element={<Navigate to="/id/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/id/admin" replace />} />

        {/* EN redirects to ID */}
        <Route path="/en/*" element={<Navigate to="/id" replace />} />

        {/* ID-only routes */}
        <Route path="/id" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="verified" element={<VerifiedPage />} />
          <Route path="buytpc" element={<BuyTpcPage />} />
          <Route path="transparency" element={<TransparencyPage />} />
          <Route path="presale-stats" element={<PresaleStatsPage />} />
          <Route path="anti-scam-faq" element={<AntiScamFaqPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="dao" element={<DaoLitePage />} />
          <Route path="dao/snapshot" element={<DaoSnapshotPage />} />
          <Route path="invoice/:invoiceNo" element={<InvoiceDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/callback" element={<AuthCallbackPage />} />

          {/* Protected member routes */}
          <Route element={<RequireAuth />}>
            <Route path="dashboard" element={<MemberShell />}>
              <Route index element={<MemberHome />} />
              <Route path="invoices" element={<MemberInvoicesPage />} />
              <Route path="invoices/:invoiceNo" element={<MemberInvoiceDetailPage />} />
              <Route path="settings" element={<MemberSettingsPage />} />
              <Route path="test" element={<MemberTestPage />} />
            </Route>

            {/* Legacy member routes */}
            <Route path="member" element={<Navigate to="dashboard" replace />} />
            <Route path="member/*" element={<Navigate to="../dashboard" replace />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={
                <div style={{color: 'white', padding: '20px'}}>
                  <h2>Admin Debug Page</h2>
                  <p>If you see this, RequireAdmin and AdminLayout work!</p>
                  <p>Now testing AdminSettingsPage...</p>
                  <AdminSettingsPage />
                </div>
              } />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="invoices" element={<div>Admin Invoices (Coming Soon)</div>} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
