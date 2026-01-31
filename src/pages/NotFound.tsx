import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logger.error('404 Error: User attempted to access non-existent route', { pathname: window.location.pathname });
  }, []);

  const handleGoHome = () => {
    // Detect language preference and redirect accordingly
    const pathname = window.location.pathname;
    if (pathname.startsWith('/en') || pathname.startsWith('/id')) {
      navigate(pathname.startsWith('/en') ? '/en' : '/id');
    } else {
      // Default to Indonesian
      navigate('/id');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <button 
          onClick={handleGoHome}
          className="text-primary underline hover:text-primary/90"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
