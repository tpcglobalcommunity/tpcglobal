import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";

// Layout Components
import { PremiumShell } from "@/components/layout/PremiumShell";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import BuyTpcPage from "@/pages/public/BuyTpcPage";
import InvoiceDetailPage from "@/pages/public/InvoiceDetailPage";
import TrustCenterPage from "@/pages/public/TrustCenterPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";
import EducationPage from "@/pages/public/EducationPage";
import CopyTradingPage from "@/pages/public/CopyTradingPage";
import StakingPage from "@/pages/public/StakingPage";
import AntiScamFaqPage from "@/pages/public/AntiScamFaqPage";
import OnePagerPage from "@/pages/public/OnePagerPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import AdminInvoicesPage from "@/pages/admin/AdminInvoicesPage";

import NotFound from "@/pages/NotFound";

// Public layout wrapper - ONLY contains PremiumShell with Outlet
const PublicLayout = () => (
  <PremiumShell>
    <Outlet />
  </PremiumShell>
);

// Wrapper for language routes - PURE LOGIC: only AuthProvider + Routes
const LangRoutes = () => (
  <AuthProvider>
    <Routes>
      {/* Public Routes with nested structure */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="verified" element={<VerifiedPage />} />
        <Route path="transparency" element={<TransparencyPage />} />
        <Route path="buytpc" element={<BuyTpcPage />} />
        <Route path="trust" element={<TrustCenterPage />} />
        <Route path="anti-scam-faq" element={<AntiScamFaqPage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="copy-trading" element={<CopyTradingPage />} />
        <Route path="staking" element={<StakingPage />} />
        <Route path="one-pager" element={<OnePagerPage />} />
        
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
      </Route>
      
      {/* Catch-all for this language */}
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
