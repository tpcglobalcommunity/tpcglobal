import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useI18n } from './hooks/useI18n';
import { HomePage } from './pages/public/HomePage';
import { VerifiedPage } from './pages/public/VerifiedPage';
import { TransparencyPage } from './pages/public/TransparencyPage';
import { PresaleStatsPage } from './pages/public/PresaleStatsPage';
import { SalesHistoryPage } from './pages/public/SalesHistoryPage';
import { WhitepaperPage } from './pages/public/WhitepaperPage';
import { RoadmapPage } from './pages/public/RoadmapPage';
import { TermsPage } from './pages/public/TermsPage';
import { FAQPage } from './pages/public/FAQPage';
import { HowToBuySafelyPage } from './pages/public/HowToBuySafelyPage';
import { BeforeDexListingPage } from './pages/public/BeforeDexListingPage';
import { PostDexDistributionPage } from './pages/public/PostDexDistributionPage';
import { DaoPage } from './pages/public/DaoPage';
import { DaoHowItWorksPage } from './pages/public/DaoHowItWorksPage';
import { DaoProposalsComingSoonPage } from './pages/public/DaoProposalsComingSoonPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { DashboardPage } from './pages/member/DashboardPage';
import { AdminGuard } from './components/guards/AdminGuard';
import { AdminHomePage } from './pages/admin/AdminHomePage';
import { AdminInvoicesPage } from './pages/admin/AdminInvoicesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { ComingSoonPage } from './pages/public/ComingSoonPage';

function App() {
  const { lang } = useI18n();

  return (
    <Router>
      <Routes>
        {/* Redirect root to default language */}
        <Route path="/" element={<Navigate to={`/${lang}`} replace />} />
        
        {/* Public routes */}
        <Route path="/:lang" element={<HomePage />} />
        <Route path="/:lang/verified" element={<VerifiedPage />} />
        <Route path="/:lang/transparency" element={<TransparencyPage />} />
        <Route path="/:lang/presale-stats" element={<PresaleStatsPage />} />
        <Route path="/:lang/sales-history" element={<SalesHistoryPage />} />
        <Route path="/:lang/whitepaper" element={<WhitepaperPage />} />
        <Route path="/:lang/roadmap" element={<RoadmapPage />} />
        <Route path="/:lang/terms" element={<TermsPage />} />
        <Route path="/:lang/faq" element={<FAQPage />} />
        <Route path="/:lang/how-to-buy-safely" element={<HowToBuySafelyPage />} />
        <Route path="/:lang/before-dex-listing" element={<BeforeDexListingPage />} />
        <Route path="/:lang/post-dex-distribution" element={<PostDexDistributionPage />} />
        
        {/* DAO routes */}
        <Route path="/:lang/dao" element={<DaoPage />} />
        <Route path="/:lang/dao/how-it-works" element={<DaoHowItWorksPage />} />
        <Route path="/:lang/dao/proposals" element={<DaoProposalsComingSoonPage />} />
        
        {/* Coming soon routes */}
        <Route path="/:lang/education" element={<ComingSoonPage title="Education" />} />
        <Route path="/:lang/marketplace" element={<ComingSoonPage title="Marketplace" />} />
        <Route path="/:lang/staking" element={<ComingSoonPage title="Staking" />} />
        <Route path="/:lang/trade-together" element={<ComingSoonPage title="Trade Together" />} />
        <Route path="/:lang/wd-consistency" element={<ComingSoonPage title="WD Consistency" />} />
        
        {/* Auth routes */}
        <Route path="/:lang/login" element={<LoginPage />} />
        <Route path="/:lang/admin/login" element={<AdminLoginPage />} />
        
        {/* Member routes */}
        <Route path="/:lang/dashboard" element={<DashboardPage />} />
        
        {/* Admin routes */}
        <Route path="/:lang/admin" element={
          <AdminGuard>
            <AdminHomePage />
          </AdminGuard>
        } />
        <Route path="/:lang/admin/invoices" element={
          <AdminGuard>
            <AdminInvoicesPage />
          </AdminGuard>
        } />
        <Route path="/:lang/admin/settings" element={
          <AdminGuard>
            <AdminSettingsPage />
          </AdminGuard>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to={`/${lang}`} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
