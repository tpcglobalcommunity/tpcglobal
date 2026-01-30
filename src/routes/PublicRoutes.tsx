import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import BuyTpcPage from "@/pages/public/BuyTpcPage";
import TrustCenterPage from "@/pages/public/TrustCenterPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";
import EducationPage from "@/pages/public/EducationPage";
import CopyTradingPage from "@/pages/public/CopyTradingPage";
import StakingPage from "@/pages/public/StakingPage";
import AntiScamFaqPage from "@/pages/public/AntiScamFaqPage";
import OnePagerPage from "@/pages/public/OnePagerPage";
import InvoiceDetailPage from "@/pages/public/InvoiceDetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";

export const PublicRoutes = () => (
  <>
    {/* Root redirect to default language */}
    <Route path="/" element={<Navigate to="/id" replace />} />
    
    {/* Language-prefixed routes */}
    <Route path="/:lang" element={<PublicLayout />}>
      {/* Main public routes */}
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
      
      {/* Auth */}
      <Route path="login" element={<LoginPage />} />
      <Route path="admin/login" element={<LoginPage />} />
    </Route>
  </>
);
