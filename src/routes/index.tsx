import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RequireAdmin } from "@/components/guards/RequireAdmin";
import { PublicLayout } from "@/layouts/PublicLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import BuyTpcPage from "@/pages/public/BuyTpcPage";
import PresaleStatsPage from "@/pages/public/PresaleStatsPage";
import TrustCenterPage from "@/pages/public/TrustCenterPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";
import MarketplaceComingSoon from "@/pages/public/MarketplaceComingSoon";
import EducationPage from "@/pages/public/EducationPage";
import CopyTradingPage from "@/pages/public/CopyTradingPage";
import StakingPage from "@/pages/public/StakingPage";
import AntiScamFaqPage from "@/pages/public/AntiScamFaqPage";
import OnePagerPage from "@/pages/public/OnePagerPage";
import InvoiceDetailPage from "@/pages/public/InvoiceDetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import DaoLitePage from "@/pages/public/DaoLitePage";
import DaoSnapshotPage from "@/pages/public/DaoSnapshotPage";
import NotFound from "@/pages/NotFound";
import { MemberRoutes } from "./MemberRoutes";
import { AdminRoutes } from "./AdminRoutes";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root redirect to default language */}
        <Route path="/" element={<Navigate to="/id" replace />} />
        
        {/* Root DAO routes (redirect to default language) */}
        <Route path="/dao" element={<Navigate to="/id/dao" replace />} />
        <Route path="/dao/snapshot" element={<Navigate to="/id/dao/snapshot" replace />} />
        
        {/* Language-prefixed routes */}
        <Route path="/:lang" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<ComingSoonPage titleKey="about.title" />} />
          <Route path="verified" element={<VerifiedPage />} />
          <Route path="transparency" element={<TransparencyPage />} />
          <Route path="presale-stats" element={<PresaleStatsPage />} />
          <Route path="buytpc" element={<BuyTpcPage />} />
          <Route path="marketplace" element={<MarketplaceComingSoon />} />
          <Route path="trust" element={<TrustCenterPage />} />
          <Route path="anti-scam-faq" element={<AntiScamFaqPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="copy-trading" element={<CopyTradingPage />} />
          <Route path="staking" element={<StakingPage />} />
          <Route path="one-pager" element={<OnePagerPage />} />
          <Route path="dao" element={<DaoLitePage />} />
          <Route path="dao/snapshot" element={<DaoSnapshotPage />} />
          
          {/* Invoice routes - NESTED and ISOLATED */}
          <Route path="invoice">
            <Route path=":invoice_no" element={<InvoiceDetailPage />} />
          </Route>
          
          {/* Coming Soon pages */}
          <Route path="whitepaper" element={<ComingSoonPage titleKey="whitepaper.title" />} />
          <Route path="roadmap" element={<ComingSoonPage titleKey="roadmap.title" />} />
          <Route path="terms" element={<ComingSoonPage titleKey="terms.title" />} />
          <Route path="faq" element={<ComingSoonPage titleKey="faq.title" />} />
          <Route path="how-to-buy-safely" element={<ComingSoonPage titleKey="howToBuy.title" />} />
          <Route path="before-dex-listing" element={<ComingSoonPage titleKey="beforeDex.title" />} />
          <Route path="post-dex-distribution" element={<ComingSoonPage titleKey="postDex.title" />} />
          <Route path="dao/how-it-works" element={<ComingSoonPage titleKey="daoHow.title" />} />
          <Route path="dao/proposals" element={<ComingSoonPage titleKey="daoProposals.title" />} />
          <Route path="trade-together" element={<ComingSoonPage titleKey="comingSoonPages.tradeTogether" />} />
          <Route path="wd-consistency" element={<ComingSoonPage titleKey="comingSoonPages.wdConsistency" />} />
          
          {/* Auth */}
          <Route path="login" element={<LoginPage />} />
          <Route path="admin/login" element={<LoginPage />} />
        </Route>

        {/* Member Routes */}
        <Route path="/member/*" element={
          <RequireAuth>
            <MemberLayout />
          </RequireAuth>
        }>
          <Route index element={<div>Member Dashboard (Coming Soon)</div>} />
          <Route path="invoices" element={<div>Member Invoices (Coming Soon)</div>} />
          <Route path="referral" element={<div>Member Referral (Coming Soon)</div>} />
          <Route path="profile" element={<div>Member Profile (Coming Soon)</div>} />
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

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
