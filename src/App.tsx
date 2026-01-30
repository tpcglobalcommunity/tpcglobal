import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import PresaleStatsPage from "@/pages/public/PresaleStatsPage";
import BuyTpcPage from "@/pages/public/BuyTpcPage";
import MarketplacePage from "@/pages/public/MarketplacePage";
import InvoiceDetailPage from "@/pages/public/InvoiceDetailPage";
import DaoPage from "@/pages/public/DaoPage";
import TrustCenterPage from "@/pages/public/TrustCenterPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";
import EducationPage from "@/pages/public/EducationPage";
import CopyTradingPage from "@/pages/public/CopyTradingPage";
import StakingPage from "@/pages/public/StakingPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import AdminInvoicesPage from "@/pages/admin/AdminInvoicesPage";

import NotFound from "@/pages/NotFound";

// Wrapper for language routes - PURE LOGIC: only AuthProvider + Routes
const LangRoutes = () => (
  <AuthProvider>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/verified" element={<VerifiedPage />} />
      <Route path="/transparency" element={<TransparencyPage />} />
      <Route path="/presale-stats" element={<PresaleStatsPage />} />
      <Route path="/buytpc" element={<BuyTpcPage />} />
      <Route path="/invoice/:invoice_no" element={<InvoiceDetailPage />} />
      <Route path="/whitepaper" element={<ComingSoonPage titleKey="whitepaper.title" />} />
      <Route path="/roadmap" element={<ComingSoonPage titleKey="roadmap.title" />} />
      <Route path="/terms" element={<ComingSoonPage titleKey="terms.title" />} />
      <Route path="/faq" element={<ComingSoonPage titleKey="faq.title" />} />
      <Route path="/how-to-buy-safely" element={<ComingSoonPage titleKey="howToBuy.title" />} />
      <Route path="/before-dex-listing" element={<ComingSoonPage titleKey="beforeDex.title" />} />
      <Route path="/post-dex-distribution" element={<ComingSoonPage titleKey="postDex.title" />} />
      <Route path="/dao" element={<DaoPage />} />
      <Route path="/dao/how-it-works" element={<ComingSoonPage titleKey="daoHow.title" />} />
      <Route path="/dao/proposals" element={<ComingSoonPage titleKey="daoProposals.title" />} />
      <Route path="/trust" element={<TrustCenterPage />} />
      <Route path="/education" element={<EducationPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/copy-trading" element={<CopyTradingPage />} />
      <Route path="/staking" element={<StakingPage />} />
      <Route path="/trade-together" element={<ComingSoonPage titleKey="comingSoonPages.tradeTogether" />} />
      <Route path="/wd-consistency" element={<ComingSoonPage titleKey="comingSoonPages.wdConsistency" />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      
      {/* Member Routes */}
      <Route path="/dashboard" element={<ComingSoonPage titleKey="dashboard.title" />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminInvoicesPage />} />
      <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
      <Route path="/admin/settings" element={<ComingSoonPage titleKey="admin.settingsTitle" />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);

const App = () => (
  <Routes>
    {/* Redirect root to default language */}
    <Route path="/" element={<Navigate to="/id" replace />} />
    
    {/* Language-prefixed routes */}
    <Route path="/id/*" element={<LangRoutes />} />
    <Route path="/en/*" element={<LangRoutes />} />
    
    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/id" replace />} />
  </Routes>
);

export default App;
