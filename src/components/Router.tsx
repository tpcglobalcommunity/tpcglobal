import { useEffect, useState } from 'react';
import { getLanguageFromPath, Language } from '../i18n';

interface RouteProps {
  component: React.ComponentType<{ lang: Language }>;
}

const Router = () => {
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

  const routes: Record<string, React.ComponentType<{ lang: Language }>> = {};

  return { currentPath, lang, routes };
};

export const Link = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default Router;
