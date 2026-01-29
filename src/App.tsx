import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/i18n/i18n";
import { AuthProvider } from "@/lib/auth";

// Public Pages
import HomePage from "@/pages/public/HomePage";
import VerifiedPage from "@/pages/public/VerifiedPage";
import TransparencyPage from "@/pages/public/TransparencyPage";
import PresaleStatsPage from "@/pages/public/PresaleStatsPage";
import ComingSoonPage from "@/pages/public/ComingSoonPage";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Wrapper for language routes
const LangRoutes = () => (
  <I18nProvider>
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/verified" element={<VerifiedPage />} />
        <Route path="/transparency" element={<TransparencyPage />} />
        <Route path="/presale-stats" element={<PresaleStatsPage />} />
        <Route path="/whitepaper" element={<ComingSoonPage titleKey="whitepaper.title" />} />
        <Route path="/roadmap" element={<ComingSoonPage titleKey="roadmap.title" />} />
        <Route path="/terms" element={<ComingSoonPage titleKey="terms.title" />} />
        <Route path="/faq" element={<ComingSoonPage titleKey="faq.title" />} />
        <Route path="/how-to-buy-safely" element={<ComingSoonPage titleKey="howToBuy.title" />} />
        <Route path="/before-dex-listing" element={<ComingSoonPage titleKey="beforeDex.title" />} />
        <Route path="/post-dex-distribution" element={<ComingSoonPage titleKey="postDex.title" />} />
        <Route path="/dao" element={<ComingSoonPage titleKey="dao.title" />} />
        <Route path="/dao/how-it-works" element={<ComingSoonPage titleKey="daoHow.title" />} />
        <Route path="/dao/proposals" element={<ComingSoonPage titleKey="daoProposals.title" />} />
        <Route path="/education" element={<ComingSoonPage titleKey="comingSoonPages.education" />} />
        <Route path="/marketplace" element={<ComingSoonPage titleKey="comingSoonPages.marketplace" />} />
        <Route path="/staking" element={<ComingSoonPage titleKey="comingSoonPages.staking" />} />
        <Route path="/trade-together" element={<ComingSoonPage titleKey="comingSoonPages.tradeTogether" />} />
        <Route path="/wd-consistency" element={<ComingSoonPage titleKey="comingSoonPages.wdConsistency" />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        
        {/* Member Routes */}
        <Route path="/dashboard" element={<ComingSoonPage titleKey="dashboard.title" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ComingSoonPage titleKey="admin.title" />} />
        <Route path="/admin/invoices" element={<ComingSoonPage titleKey="admin.invoicesTitle" />} />
        <Route path="/admin/settings" element={<ComingSoonPage titleKey="admin.settingsTitle" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </I18nProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to default language */}
          <Route path="/" element={<Navigate to="/id" replace />} />
          
          {/* Language-prefixed routes */}
          <Route path="/id/*" element={<LangRoutes />} />
          <Route path="/en/*" element={<LangRoutes />} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/id" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
