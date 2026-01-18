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

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const lang = getLanguageFromPath();

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
      default:
        return <Home lang={lang} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader lang={lang} currentPath={currentPath} />
      <main className="flex-1 pb-20 md:pb-0">{renderPage()}</main>
      <LegalFooter lang={lang} />
      <BottomNav lang={lang} currentPath={currentPath} />
    </div>
  );
}

export default App;
