import { useEffect, useState } from 'react';
import { getLanguageFromPath } from './i18n';
import AppHeader from './components/AppHeader';
import LegalFooter from './components/LegalFooter';
import BottomNav from './components/BottomNav';
import AuthLayout from './components/auth/AuthLayout';
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
import ProfileGate from './components/guards/ProfileGate';
import MemberHome from './pages/member/MemberHome';
import Services from './pages/member/Services';
import Dashboard from './pages/member/Dashboard';
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
import AdminControlCenterPage from './pages/admin/AdminControlCenterPage';
import VendorApplyPage from './pages/member/VendorApplyPage';
import MarketplacePage from './pages/MarketplacePage';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const lang = getLanguageFromPath(currentPath);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      window.history.replaceState({}, '', '/en/home');
      setCurrentPath('/en/home');
    } else if (!currentPath.match(/^\/(en|id)\//)) {
      window.history.replaceState({}, '', `/en${currentPath}`);
      setCurrentPath(`/en${currentPath}`);
    }
  }, [currentPath]);

  const isAuthPage = (path: string) => {
    const pathWithoutLang = path.replace(/^\/(en|id)/, '');
    return ['/signin', '/signup', '/forgot', '/reset'].includes(pathWithoutLang);
  };

  const isAdminPage = (path: string) => {
    const pathWithoutLang = path.replace(/^\/(en|id)/, '');
    return pathWithoutLang.startsWith('/admin');
  };

  const shouldShowBottomNav = !isAuthPage(currentPath) && !isAdminPage(currentPath);

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
      case '/forgot':
        return <ForgotPassword />;
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
      case '/member/dashboard':
        return (
          <MemberGate>
            <ProfileGate>
              <Dashboard lang={lang} />
            </ProfileGate>
          </MemberGate>
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
        return <AuthLogsPage lang={lang} />;
      case '/admin/vendors':
        return <VendorsAdminPage lang={lang} />;
      case '/admin/control':
        return <AdminControlCenterPage />;
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
    <div className="min-h-screen flex flex-col">
      <AppHeader lang={lang} currentPath={currentPath} />
      <main className={`flex-1 ${shouldShowBottomNav ? 'pb-[calc(72px+env(safe-area-inset-bottom)+16px)] xl:pb-0' : ''}`}>
        {renderPage()}
      </main>
      <LegalFooter lang={lang} />
      {shouldShowBottomNav && <BottomNav lang={lang} currentPath={currentPath} />}
    </div>
  );
}

export default App;
