import { useEffect, useState } from 'react';
import { getLanguageFromPath, getLangPath } from './i18n';
import AppHeader from './components/AppHeader';
import LegalFooter from './components/LegalFooter';
import BottomNav from './components/BottomNav';
import AuthLayout from './components/auth/AuthLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Docs from './pages/Docs';
import DAOLite from './pages/DAOLite';
import Transparency from './pages/Transparency';
import CommunityFund from './pages/CommunityFund';
import Legal from './pages/Legal';
import LaunchChecklist from './pages/LaunchChecklist';
import Security from './pages/Security';
import Support from './pages/Support';
import Whitepaper from './pages/Whitepaper';
import Roadmap from './pages/Roadmap';
import Faq from './pages/Faq';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import CompleteProfile from './pages/member/CompleteProfilePage';
import MemberGate from './components/guards/MemberGuard';
import MemberStatusGuard from './components/member/MemberGuard';
import ProfileGate from './components/guards/ProfileGate';
import AdminGuard from './components/guards/AdminGuard';
import MemberHome from './pages/member/MemberHome';
import Services from './pages/member/Services';
import SecurityPage from './pages/member/SecurityPage';
import ProfilePage from './pages/member/ProfilePage';
import AnnouncementsPage from './pages/member/AnnouncementsPage';
import ReferralsPage from './pages/member/ReferralsPage';
import DirectoryPage from './pages/member/DirectoryPage';
import VerifyPage from './pages/VerifyPage';
import PublicProfilePage from './pages/PublicProfilePage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import NewsEditorPage from './pages/admin/NewsEditorPage';
import NewsAdminListPage from './pages/admin/NewsAdminListPage';
import AnnouncementsAdminListPage from './pages/admin/AnnouncementsAdminListPage';
import AnnouncementEditorPage from './pages/admin/AnnouncementEditorPage';
import AuthLogsPage from './pages/admin/AuthLogsPage';
import VendorsAdminPage from './pages/admin/VendorsAdminPage';
import VerificationQueuePage from './pages/admin/VerificationQueuePage';
import MemberDetailPage from './pages/admin/MemberDetailPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminControlCenterPage from './pages/admin/AdminControlCenterPage';
import EmailQueuePage from './pages/admin/EmailQueuePage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBroadcastCenter from './pages/admin/AdminBroadcastCenter';
import AdminTransparencyPage from './pages/admin/AdminTransparencyPage';
import TransparencyPage from './pages/public/TransparencyPage';
import VendorApplyPage from './pages/member/VendorApplyPage';
import MarketplacePage from './pages/MarketplacePage';
import MaintenancePage from './pages/system/MaintenancePage';
import GlobalBanner from './components/system/GlobalBanner';
import ToastHost from './components/ui/ToastHost';
import WelcomePage from './pages/member/WelcomePage';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import ProgramsPage from './pages/member/ProgramsPage';
import MemberVerifyPage from './pages/member/VerifyPage';
import NotificationsPage from './pages/member/NotificationsPage';
import MemberSettingsPage from './pages/member/MemberSettingsPage';
import WalletPage from './pages/member/WalletPage';
import WalletTiersPage from './pages/admin/WalletTiersPage';
import { fetchAppSettings, type AppSettings } from './lib/settings';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const lang = getLanguageFromPath(currentPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [appSettings]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await fetchAppSettings();
        if (!alive) return;
        setAppSettings(s);
      } catch (e: any) {
        if (!alive) return;
        // Settings error handled by WelcomePage
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (appSettings?.maintenance_mode) {
      window.location.href = `${getLangPath(lang, "")}/maintenance`;
      return;
    }
  }, [appSettings, lang]);

  useEffect(() => {
    const path = window.location.pathname || "/";

    // root -> default
    if (path === "/" || path === "") {
      window.history.replaceState({}, "", "/en/home");
      setCurrentPath("/en/home");
      return;
    }

    // kalau tidak diawali /en/ atau /id/, paksa ke /en + path
    if (!/^\/(en|id)\//.test(path)) {
      const next = `/en${path.startsWith("/") ? path : `/${path}`}`;
      window.history.replaceState({}, "", next);
      setCurrentPath(next);
      return;
    }

    // normal
    setCurrentPath(path);
  }, []);

  const isAuthPage = (path: string) => {
    const pathWithoutLang = path.replace(/^\/(en|id)/, '');
    return ['/signin', '/signup', '/forgot', '/reset'].includes(pathWithoutLang);
  };

  const isAdminPage = (path: string) => {
    const pathWithoutLang = path.replace(/^\/(en|id)/, '');
    return pathWithoutLang.startsWith('/admin');
  };

  const shouldShowBottomNav = !isAuthPage(currentPath) && !isAdminPage(currentPath);

  // Maintenance mode guard
  const maintenanceOn = !!appSettings?.maintenance_mode;
  const isAdminRoute = isAdminPage(currentPath);
  const isSigninRoute = isAuthPage(currentPath) && currentPath.includes('/signin');
  
  if (maintenanceOn && !isAdminRoute && !isSigninRoute) {
    return <MaintenancePage lang={lang} />;
  }

  const renderPage = () => {
    const pathWithoutLang = currentPath.replace(/^\/(en|id)/, '');

    if (pathWithoutLang === '/admin/news') {
      return <NewsAdminListPage />;
    }

    if (pathWithoutLang === '/admin/news/new') {
      return <NewsEditorPage />;
    }

    if (pathWithoutLang.startsWith('/admin/news/') && pathWithoutLang.endsWith('/edit')) {
      const postId = pathWithoutLang.replace('/admin/news/', '').replace('/edit', '');
      return <NewsEditorPage postId={postId} />;
    }

    if (pathWithoutLang.startsWith('/news/')) {
      const slug = pathWithoutLang.replace('/news/', '');
      return <NewsDetailPage slug={slug} />;
    }

    if (pathWithoutLang === '/admin/announcements') {
      return <AnnouncementsAdminListPage lang={lang} />;
    }

    if (pathWithoutLang === '/admin/announcements/new') {
      return <AnnouncementEditorPage lang={lang} />;
    }

    if (pathWithoutLang.startsWith('/admin/announcements/') && pathWithoutLang.endsWith('/edit')) {
      const announcementId = pathWithoutLang.replace('/admin/announcements/', '').replace('/edit', '');
      return <AnnouncementEditorPage lang={lang} announcementId={announcementId} />;
    }

    if (pathWithoutLang.startsWith('/u/')) {
      const username = pathWithoutLang.replace('/u/', '');
      return <PublicProfilePage lang={lang} username={username} />;
    }

    switch (pathWithoutLang) {
      case '/home':
        return <Home lang={lang} />;
      case '/docs':
        return <Docs lang={lang} />;
      case '/dao':
        return <DAOLite lang={lang} />;
      case '/transparency':
        return <Transparency lang={lang} />;
      case '/public/transparency':
        return <TransparencyPage />;
      case '/fund':
        return <CommunityFund lang={lang} />;
      case '/legal':
        return <Legal lang={lang} />;
      case '/whitepaper':
        return <Whitepaper lang={lang} />;
      case '/roadmap':
        return <Roadmap lang={lang} />;
      case '/faq':
        return <Faq lang={lang} />;
      case '/launch':
        return <LaunchChecklist lang={lang} />;
      case '/security':
        return <Security lang={lang} />;
      case '/support':
        return <Support lang={lang} />;
      case '/signup':
        return <SignUp />;
      case '/signin':
        return <SignIn />;
      case '/admin/login':
        return <SignIn lang={lang} next={`/${lang}/admin/control`} />;
      case '/forgot':
        return <ForgotPassword lang={lang} />;
      case '/reset':
        return <ResetPassword lang={lang} />;
      case '/complete-profile':
        return <CompleteProfile lang={lang} />;
      case '/member/complete-profile':
        return <CompleteProfile lang={lang} />;
      case '/member':
        return (
          <MemberGate>
            <ProfileGate>
              <MemberHome lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/welcome':
        return <WelcomePage lang={lang} />;
      case '/member/dashboard':
        return (
          <MemberStatusGuard lang={lang} allowPending={true}>
            <MemberDashboardPage lang={lang} />
          </MemberStatusGuard>
        );
      case '/member/programs':
        return (
          <MemberStatusGuard lang={lang}>
            <ProgramsPage lang={lang} />
          </MemberStatusGuard>
        );
      case '/member/verify':
        return (
          <MemberStatusGuard lang={lang}>
            <MemberVerifyPage lang={lang} />
          </MemberStatusGuard>
        );
      case '/member/notifications':
        return (
          <MemberStatusGuard lang={lang}>
            <NotificationsPage lang={lang} />
          </MemberStatusGuard>
        );
      case '/member/settings':
        return (
          <MemberStatusGuard lang={lang}>
            <MemberSettingsPage lang={lang} />
          </MemberStatusGuard>
        );
      case '/member/wallet':
        return (
          <MemberStatusGuard lang={lang}>
            <WalletPage />
          </MemberStatusGuard>
        );
      case '/member/security':
        return (
          <MemberGate>
            <ProfileGate>
              <SecurityPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/profile':
        return (
          <MemberGate>
            <ProfileGate>
              <ProfilePage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/announcements':
        return (
          <MemberGate>
            <ProfileGate>
              <AnnouncementsPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/referrals':
        return (
          <MemberGate>
            <ProfileGate>
              <ReferralsPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/directory':
        return (
          <MemberGate>
            <ProfileGate>
              <DirectoryPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/vendor/apply':
        return (
          <MemberGate>
            <ProfileGate>
              <VendorApplyPage lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/member/services':
        return (
          <MemberGate>
            <ProfileGate>
              <Services lang={lang} />
            </ProfileGate>
          </MemberGate>
        );
      case '/marketplace':
        return <MarketplacePage lang={lang} />;
      case '/verify':
        return <VerifyPage lang={lang} />;
      case '/news':
        return <NewsPage />;
      case '/admin/auth-logs':
        return (
          <AdminGuard lang={lang}>
            <AuthLogsPage lang={lang} />
          </AdminGuard>
        );
      case '/admin/vendors':
        return (
          <AdminGuard lang={lang}>
            <VendorsAdminPage lang={lang} />
          </AdminGuard>
        );
      case '/admin/verification':
        return (
          <AdminGuard lang={lang}>
            <VerificationQueuePage lang={lang} />
          </AdminGuard>
        );
      case '/admin/member':
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <MemberDetailPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );
      case '/admin/audit':
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AuditLogPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );
      case '/admin/settings':
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminSettingsPage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );
      case '/admin/email-queue':
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <EmailQueuePage lang={lang} />
            </AdminLayout>
          </AdminGuard>
        );
      case '/admin/control':
        return (
          <AdminGuard lang={lang}>
            <AdminControlCenterPage />
          </AdminGuard>
        );
      case '/admin/broadcast':
        return (
          <AdminGuard lang={lang}>
            <AdminBroadcastCenter />
          </AdminGuard>
        );
      case '/admin/wallet-tiers':
        return (
          <AdminGuard lang={lang}>
            <WalletTiersPage lang={lang} />
          </AdminGuard>
        );
      case '/admin/transparency-input':
        return (
          <AdminGuard lang={lang}>
            <AdminLayout lang={lang}>
              <AdminTransparencyPage />
            </AdminLayout>
          </AdminGuard>
        );
      default:
        return <Home lang={lang} />;
    }
  };

  if (isAuthPage(currentPath)) {
    return (
      <AuthLayout lang={lang}>
        {renderPage()}
      </AuthLayout>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <GlobalBanner lang={lang} />
        <AppHeader lang={lang} currentPath={currentPath} />
        <main className={`flex-1 ${shouldShowBottomNav ? 'pb-[calc(72px+env(safe-area-inset-bottom)+16px)] xl:pb-0' : ''}`}>
          {renderPage()}
        </main>
        <LegalFooter lang={lang} />
        <ToastHost lang={lang} />
        {shouldShowBottomNav && <BottomNav lang={lang} currentPath={currentPath} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
