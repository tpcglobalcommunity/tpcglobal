import { useEffect, useState } from 'react';
import { getLanguageFromPath } from './i18n';
import AppHeader from './components/AppHeader';
import LegalFooter from './components/LegalFooter';
import BottomNav from './components/BottomNav';
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
import Dashboard from './pages/member/Dashboard';
import SecurityPage from './pages/member/SecurityPage';
import VerifyPage from './pages/VerifyPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import NewsEditorPage from './pages/admin/NewsEditorPage';
import NewsAdminListPage from './pages/admin/NewsAdminListPage';
import AuthLogsPage from './pages/admin/AuthLogsPage';

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
        return <SignUp lang={lang} />;
      case '/signin':
        return <SignIn lang={lang} />;
      case '/forgot':
        return <ForgotPassword lang={lang} />;
      case '/reset':
        return <ResetPassword lang={lang} />;
      case '/member/dashboard':
        return <Dashboard lang={lang} />;
      case '/member/security':
        return <SecurityPage lang={lang} />;
      case '/verify':
        return <VerifyPage lang={lang} />;
      case '/news':
        return <NewsPage />;
      case '/admin/auth-logs':
        return <AuthLogsPage lang={lang} />;
      default:
        return <Home lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader lang={lang} currentPath={currentPath} />
      <main className="flex-1 pb-[calc(72px+env(safe-area-inset-bottom)+16px)] md:pb-0">{renderPage()}</main>
      <LegalFooter lang={lang} />
      <BottomNav lang={lang} currentPath={currentPath} />
    </div>
  );
}

export default App;
